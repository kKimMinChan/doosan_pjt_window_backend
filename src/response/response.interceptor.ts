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
        let statusCode = response.statusCode;

        const result = statusCode >= 200 && statusCode < 400;

        const method = request.method;
        let message: string;

        const translate = data?.translate || undefined;
        if (data?.translate) {
          delete data.translate;
        }

        // 데이터가 비어 있는지 확인 (배열, 객체 모두 검사)
        const isEmpty =
          data === undefined ||
          data === null ||
          (Array.isArray(data) && data.length === 0) ||
          (typeof data === 'object' && Object.keys(data).length === 0);

        // 데이터가 비어 있으면 204 상태 코드로 변경
        if (isEmpty) {
          statusCode = 204;
          message = 'No Content';
        } else {
          // 메서드별 메시지 설정
          switch (method) {
            case 'GET':
              message = 'OK';
              break;
            case 'POST':
              message = 'Created';
              break;
            case 'PUT':
              message = 'Updated';
              break;
            case 'DELETE':
              message = 'Deleted';
              break;
            default:
              message = '요청이 성공적으로 처리되었습니다.';
          }
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
