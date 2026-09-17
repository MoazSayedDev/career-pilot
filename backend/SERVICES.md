# Backend service guide

This document explains the business responsibilities of the requested NestJS
services. Controllers authenticate the request with `JwtAuthGuard` and pass the
authenticated user's ID (`user.sub`) to the service. Services use Prisma for
persistence and return domain records or DTO-shaped results.

## Service overview

| Service | Responsibility | Public route(s) |
| --- | --- | --- |
| `UsersService` | User lifecycle, password verification, account-lock protection, and response sanitization | Used by authentication flows; no direct controller |
| `ExperienceService` | CRUD for a user's work history | `/experience` |
| `EducationService` | CRUD for a user's education history | `/education` |
| `AiService` | Resume optimization with Gemini and per-user Gemini key management | `/ai` |
| `GeminiApiKeyService` | Encrypts and stores personal Gemini API keys and resolves the effective key | Used by `AiService` and `ResumeService` |
| `PdfService` | Builds a PDF from an owned resume and profile | `/pdf/:resumeId` |
| `UsageService` | Enforces monthly CV-generation and job-description limits | Used by `ResumeService`; exported for other modules |

All routes listed above require a valid JWT. Resource IDs on the experience,
education, and PDF routes must be UUIDs.

## ExperienceService

Source: [`experience.service.ts`](./src/experience/experience.service.ts)

`ExperienceService` stores work-history records under the authenticated user's
profile. It never accepts a profile ID from the client: it first resolves the
profile by `userId`, then uses that profile ID for every query. This prevents a
user from reading or modifying another user's experience.

### Operations

| Method | Route | Behavior |
| --- | --- | --- |
| `create(userId, dto)` | `POST /experience` | Verifies the profile exists and creates a record linked to it |
| `findAll(userId)` | `GET /experience` | Returns the user's records ordered by `startDate` descending |
| `findOne(userId, experienceId)` | `GET /experience/:id` | Returns the record only when its ID belongs to the user's profile |
| `update(userId, experienceId, dto)` | `PATCH /experience/:id` | Verifies ownership, then applies the partial DTO |
| `remove(userId, experienceId)` | `DELETE /experience/:id` | Verifies ownership, then deletes the record |

### Experience fields

Create requests require `company`, `position`, `employmentType`,
`startDate`, `currentlyWorking`, `description` (string array), and
`technologies` (string array). Optional fields are `location` and `endDate`.
The DTO limits company and position to 120 characters and validates dates,
employment type, booleans, and arrays. `UpdateExperienceDto` makes all create
fields optional.

If the profile does not exist, the service throws `404 Profile not found`. If
the record does not exist or belongs to another profile, it throws
`404 Experience not found`.

## EducationService

Source: [`education.service.ts`](./src/education/education.service.ts)

`EducationService` stores academic-history records under the authenticated
user's profile. Like `ExperienceService`, it resolves the profile from the
authenticated `userId` and scopes every read, update, and delete operation to
that profile.

### Operations

| Method | Route | Behavior |
| --- | --- | --- |
| `create(userId, dto)` | `POST /education` | Verifies the profile exists and creates a linked education record |
| `findAll(userId)` | `GET /education` | Returns the user's records ordered by `startDate` descending |
| `findOne(userId, educationId)` | `GET /education/:id` | Returns an owned education record |
| `update(userId, educationId, dto)` | `PATCH /education/:id` | Verifies ownership, then applies the partial DTO |
| `remove(userId, educationId)` | `DELETE /education/:id` | Verifies ownership, then deletes the record |

### Education fields

Create requests require `university`, `degree`, `field`, and `startDate`.
Optional fields are `grade`, `description`, and `endDate`. The DTO validates
dates and string values and applies maximum lengths:

- `university`, `degree`, and `field`: 150 characters
- `grade`: 100 characters
- `description`: 500 characters

`UpdateEducationDto` makes all create fields optional. Missing profiles produce
`404 Profile not found`; missing or non-owned records produce
`404 Education not found`.

## AiService

Source: [`ai.service.ts`](./src/ai/ai.service.ts)

`AiService` integrates resume data with Google Gemini:

1. Loads the authenticated user's profile with `ProfileService`.
2. Builds the resume-optimizer prompt from the job description and profile JSON.
3. Resolves a Gemini API key through `GeminiApiKeyService`.
4. Calls the configured model (`GEMINI_MODEL`, defaulting to `gemini-2.5-flash`).
5. Removes optional Markdown JSON fences and parses the model response.

### Operations

| Method | Route | Behavior |
| --- | --- | --- |
| `optimizeResume(userId, jobDescription)` | `POST /ai/optimize-resume` | Returns parsed AI-selected resume data for the job description |
| `setGeminiApiKey(userId, apiKey)` | `POST /ai/gemini-key`, `PUT /ai/gemini-key` | Encrypts and stores the user's personal key |
| `clearGeminiApiKey(userId)` | `DELETE /ai/gemini-key` | Removes the user's personal key |
| `getGeminiApiKeyStatus(userId)` | `GET /ai/gemini-key/status` | Returns `{ configured: boolean }` without exposing the key |

When no personal key is configured, the key service may use the server
`GEMINI_API_KEY`. A missing effective key results in `503 AI service is not
configured`. Missing profiles result in `404 Profile not found`; Gemini
failures and invalid model responses are surfaced as a `503` response.

## GeminiApiKeyService

Source: [`gemini-api-key.service.ts`](./src/gemini/gemini-api-key.service.ts)

This service is the key-management boundary for Gemini credentials. It:

- Trims and validates a supplied key.
- Encrypts it with AES-256-GCM using a key derived from `GEMINI_ENCRYPTION_KEY`
  via `scryptSync`.
- Stores the serialized value as `iv:authTag:ciphertext` on the `User` record.
- Decrypts a stored personal key only when another service needs to call Gemini.
- Falls back to the server `GEMINI_API_KEY` when no personal key exists.
- Reports whether a personal key is configured without returning secrets.

`GEMINI_ENCRYPTION_KEY` is required when encrypting or decrypting. Empty input
is rejected with `400`, missing encryption configuration produces `500`, and an
invalid stored ciphertext produces `500`. The raw key is never returned by an
HTTP endpoint.

## PdfService

Source: [`pdf.service.ts`](./src/pdf/pdf.service.ts)

`PdfService.generatePdf(userId, resumeId)`:

1. Loads the resume through `ResumeService.findOne(userId, resumeId)`, which
   enforces ownership.
2. Loads the authenticated user's profile.
3. Combines both records with `mapResumeToCvData`.
4. Passes the mapped data and the resume's template to `PdfGenerator`.
5. Returns the generated PDF as a `Buffer`.

`GET /pdf/:resumeId` sends that buffer with `Content-Type: application/pdf`,
an attachment filename of `resume-<resumeId>.pdf`, and the correct content
length. The service itself does not persist a PDF file.

## UsageService

Source: [`usage.service.ts`](./src/usage/usage.service.ts)

`UsageService` tracks usage in the `Usage` table using one UTC record per user
and calendar month. The unique `(userId, month)` key makes record creation
idempotent.

Current limits are defined in [`usage.constants.ts`](./src/usage/usage.constants.ts):

- CV generations: **2 per month**
- Job-description optimizations: **2 per month**

### Operations

- `getCurrentUsage(userId)` creates the current record if needed and returns
  `used`, `limit`, `remaining`, and the UTC month for both counters.
- `canUseCv(userId)` and `canUseJobDescription(userId)` check availability
  without incrementing a counter.
- `consumeCv(userId)` and `consumeJobDescription(userId)` increment the
  corresponding counter.

Consumption is concurrency-safe: the increment uses a conditional update that
only succeeds while the counter is below its limit. If the limit has already
been reached, the service throws `403 CV monthly limit reached.` or
`403 Job description monthly limit reached.`.

`ResumeService` consumes a CV allowance when creating a normal resume. For
AI-generated resumes, it consumes a job-description allowance only when the
user does not have a personal Gemini key.

## UsersService

Source: [`users.service.ts`](./src/users/users.service.ts)

`UsersService` contains user business rules and delegates database operations
to `UsersRepository`. It is exported by `UsersModule` and used by
authentication flows.

### Responsibilities

- Creates users after hashing passwords with `PasswordUtil`; trims usernames
  and lowercases emails.
- Finds users by ID, email, or username.
- Verifies plaintext passwords against stored hashes.
- Detects active account locks.
- Tracks failed logins and locks an account after **5** failed attempts for
  **15 minutes**.
- Resets failed attempts and records the last login after successful login.
- Marks accounts as verified and updates passwords.
- Checks whether an email or username already exists.
- Sanitizes user responses to include only ID, username, email, verification
  status, and timestamps.

The sanitized response deliberately excludes `passwordHash`,
`encryptedGeminiApiKey`, failed-login counters, and lock timestamps. Internal
lookup methods return the full Prisma `User` object only for trusted
server-side authentication logic.

## Common ownership and error behavior

Experience and education records are linked to `Profile`, while usage and
Gemini-key records are linked to `User`. A service should receive the user ID
from the authenticated JWT, not from request-body data. The profile-owned
services perform an ownership query before every single-record operation, so a
record belonging to another user is indistinguishable from a missing record
and returns `404`.

Validation errors are handled by NestJS DTO validation and route UUID pipes.
Business-rule failures use explicit NestJS exceptions (`NotFoundException`,
`ForbiddenException`, `BadRequestException`, or
`ServiceUnavailableException`) so the global exception filter can produce the
standard API response.
