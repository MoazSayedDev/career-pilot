import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/**
 * Global Exception Filter
 * Catches all exceptions and formats them consistently
 * Prevents leaking internal error details
 * Handles specific Prisma errors
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const { message: msg, error: err } = exceptionResponse as Record<
          string,
          unknown
        >;
        message = (msg as string) || message;
        error = (err as string) || error;
      } else {
        message = exceptionResponse as string;
      }

      // Rate limiter leaks its internal class name in the message
      // ("ThrottlerException: ...") — replace it with a client-safe one.
      if (status === HttpStatus.TOO_MANY_REQUESTS) {
        message = 'Too many requests. Please try again later.';
        error = 'Too Many Requests';
      }
    }
    // Handle Prisma unique constraint violations
    else if (exception instanceof PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        // Composite targets include ownership columns (e.g. profileId) that
        // mean nothing to the client — surface a generic, safe message.
        message = 'A record with these details already exists.';
        error = 'Conflict';
      } else {
        this.logger.error('Prisma error:', exception);
        message = 'Database error';
        error = 'Internal Server Error';
      }
    }
    // Handle validation errors
    else if (exception instanceof TypeError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation error';
      error = 'Bad Request';
    }
    // Log unknown errors
    else {
      this.logger.error('Unexpected error:', exception);
    }

    // Format response
    response.status(status).json({
      success: false,
      message,
      error,
      statusCode: status,
    });
  }
}
