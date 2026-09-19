// src/auth/guards/google-oauth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {}
