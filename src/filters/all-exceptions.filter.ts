import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let cause;

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    if (exception instanceof HttpException) {
      cause = (exception as any)?.cause || null; // cause를 추가적으로 추출
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      cause: cause ? cause.message : null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
