import { getSchemaPath } from '@nestjs/swagger';

export class SwaggerHelper {
  static getApiResponseSchema(
    dto?: any,
    description = '',
    isArray = false,
    isMessageOnly = false,
  ) {
    return {
      description,
      schema: isMessageOnly
        ? {
            type: 'object',
            properties: {
              statusCode: {
                type: 'number',
                description: 'HTTP 상태 코드',
                example: 201,
              },
              message: {
                type: 'string',
                description: '응답 메시지',
                example: '요청이 성공적으로 처리되었습니다.',
              },
            },
          }
        : {
            type: 'object',
            properties: {
              statusCode: {
                type: 'number',
                description: 'HTTP 상태 코드',
                example: 201,
              },
              message: {
                type: 'string',
                description: '응답 메시지',
                example: '요청이 성공적으로 처리되었습니다.',
              },
              data: isArray
                ? { type: 'array', items: { $ref: getSchemaPath(dto) } }
                : { $ref: getSchemaPath(dto) }, // 특정 DTO를 참조
            },
          },
    };
  }
}
