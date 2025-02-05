import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CoreResponse {
  statusCode: number; // HTTP 상태 코드
  message: string; // 응답 메시지
  translate?: string | undefined;
  result: boolean;
}

export interface PageInfo {
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}

export interface ApiResponse<T> extends CoreResponse, PageInfo {
  data: T;
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
      map((responseData) => {
        const response = context.switchToHttp().getResponse();
        const request = context.switchToHttp().getRequest();
        let statusCode = response.statusCode;

        const result = statusCode >= 200 && statusCode < 400;

        const method = request.method;
        let message: string;

        const translate = responseData?.translate || undefined;
        if (responseData?.translate) {
          delete responseData.translate;
        }

        // 데이터가 비어 있는지 확인 (배열, 객체 모두 검사)
        const isEmpty =
          responseData === undefined ||
          responseData === null ||
          (Array.isArray(responseData) && responseData.length === 0) ||
          (typeof responseData === 'object' &&
            Object.keys(responseData).length === 0);

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
        const { totalCount, totalPages, page, pageSize, data } = responseData;
        console.log(responseData);
        return {
          statusCode,
          message,
          translate,
          result,
          totalCount,
          totalPages,
          pageSize,
          page,
          data,
        };
      }),
    );
  }
}
