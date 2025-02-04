import { getSchemaPath } from '@nestjs/swagger';

export class SwaggerHelper {
  static getApiResponseSchema(dto?: any, description = '') {
    return {
      description,
      schema: {
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
          result: {
            type: 'boolean',
            description: 'api 성공 여부',
            example: true,
          },
          translate: {
            type: 'string',
            description: '추가 설명',
            example: '',
          },
          data: dto
            ? { type: 'array', items: { $ref: getSchemaPath(dto) } }
            : '',
        },
      },
    };
  }
}
