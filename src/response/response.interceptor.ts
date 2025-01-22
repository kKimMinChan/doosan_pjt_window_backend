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
        const statusCode = response.statusCode;

        const message = data?.message || '요청이 성공적으로 처리되었습니다.';

        if (data?.message) {
          delete data.message;
        }

        return {
          statusCode,
          message,
          data,
        };
      }),
    );
  }
}
