import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  statusCode: number; // HTTP 상태 코드
  message: string; // 응답 메시지
  data: T; // 실제 데이터 (제네릭으로 설정)
  translate?: string | undefined;
  result: boolean;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const request = context.switchToHttp().getRequest();
        const statusCode = response.statusCode;

        const result = statusCode >= 200 && statusCode < 400;

        const method = request.method;
        let message: string;

        switch (method) {
          case 'GET':
            message =
              Array.isArray(data) && data.length === 0 ? 'No Content' : 'OK';
            break;
          case 'POST':
            message =
              Array.isArray(data) && data.length === 0
                ? 'No Content'
                : 'Created';
            break;
          case 'PUT':
            message =
              Array.isArray(data) && data.length === 0
                ? 'No Content'
                : 'Updated';
            break;
          case 'DELETE':
            message =
              Array.isArray(data) && data.length === 0
                ? 'No Content'
                : 'Deleted';
            break;
          default:
            message = '요청이 성공적으로 처리되었습니다.';
        }

        const translate = data?.translate || undefined;
        if (data?.message || data?.translate) {
          delete data.message;
          delete data.translate;
        }

        return {
          statusCode,
          message,
          translate,
          result,
          data,
        };
      }),
    );
  }
}
