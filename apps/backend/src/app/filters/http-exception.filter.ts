import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface HttpExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const getErrorMessage = (response: string | object): string => {
      if (typeof response === 'string') {
        return response;
      }
      const responseObj = response as HttpExceptionResponse;
      if (responseObj.message) {
        return Array.isArray(responseObj.message)
          ? responseObj.message.join(', ')
          : responseObj.message;
      }
      return 'An error occurred';
    };

    const getErrorType = (response: string | object, defaultError: string): string => {
      if (typeof response === 'object') {
        const responseObj = response as HttpExceptionResponse;
        return responseObj.error || defaultError;
      }
      return defaultError;
    };

    const errorResponse = {
      success: false,
      statusCode: status,
      message: getErrorMessage(exceptionResponse),
      error: getErrorType(exceptionResponse, exception.name),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - ${errorResponse.message}`,
      exception.stack
    );

    response.status(status).json(errorResponse);
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      success: false,
      statusCode: status,
      message:
        exception instanceof Error
          ? exception.message
          : 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status}`,
      exception instanceof Error ? exception.stack : exception
    );

    response.status(status).json(errorResponse);
  }
}
