import {
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import mongoose from 'mongoose';

export class DuplicateDateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateDateError';
  }
}

export class ResourceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResourceNotFoundError';
  }
}

export class ErrorHelper {
  static handleError(error: unknown): never {
    console.log(error, 'error');

    // 커스텀 타입 가드
    const isErrorWithMessage = (err: unknown): err is { message: string } =>
      typeof err === 'object' &&
      err !== null &&
      'message' in err &&
      typeof (err as any).message === 'string';

    function isErrorWithCode(
      error: unknown,
    ): error is Error & { code?: string } {
      return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as any).message === 'string' &&
        'code' in error &&
        typeof (error as any).code === 'string'
      );
    }

    if (error instanceof HttpException) {
      const statusCode =
        typeof error.getStatus === 'function'
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(error.message, statusCode);
    }

    if (error instanceof DuplicateDateError) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }

    if (error instanceof ResourceNotFoundError) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }

    if (
      isErrorWithMessage(error) &&
      (error.message.includes('Cast to ObjectId') ||
        error.message.includes('input must be a 24 character hex string'))
    ) {
      throw new HttpException(
        `잘못된 ID 형식입니다. 유효한 ObjectId를 제공해주세요: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      isErrorWithMessage(error) &&
      error.message.includes('Timed out while waiting for handshake')
    ) {
      throw new HttpException(
        `RasPi 서버와의 연결이 타임아웃되었습니다. RasPi 서버가 실행 중인지 확인해주세요: ${error.message}`,
        HttpStatus.GATEWAY_TIMEOUT,
      );
    }

    if (isErrorWithCode(error) && error.code === 'EHOSTDOWN') {
      throw new HttpException(
        `RasPi 서버와의 연결이 거부되었습니다. RasPi 서버가 실행 중인지 확인해주세요: ${error.message}`,
        HttpStatus.GATEWAY_TIMEOUT,
      );
    }

    if (typeof error === 'string' && error.includes('No network with SSID')) {
      throw new HttpException(
        `입력하신 SSID를 주변에서 찾을 수 없습니다.`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    console.error(error, 'error');

    const errorMessage = isErrorWithMessage(error)
      ? error.message
      : 'Unknown error occurred';

    throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

// export class ErrorHelper {
//   static handleError(error: unknown): never {
//     if (error instanceof HttpException) {
//       // ✅ getStatus()가 없으면 500으로 처리
//       const statusCode =
//         typeof error.getStatus === 'function'
//           ? error.getStatus()
//           : HttpStatus.INTERNAL_SERVER_ERROR;

//       throw new HttpException(error.message, statusCode);
//     }

//     if (error instanceof DuplicateDateError) {
//       throw new HttpException(error.message, HttpStatus.CONFLICT);
//     }
//     if (error instanceof ResourceNotFoundError) {
//       throw new HttpException(error.message, HttpStatus.NOT_FOUND);
//     }

//     // ✅ ObjectId 형식 오류 검출
//     if (
//       error?.message?.includes('Cast to ObjectId') ||
//       error?.message?.includes('input must be a 24 character hex string')
//     ) {
//       throw new HttpException(
//         `잘못된 ID 형식입니다. 유효한 ObjectId를 제공해주세요: ${error.message}`,
//         HttpStatus.BAD_REQUEST,
//       );
//     }

//     if (error?.message?.includes('Timed out while waiting for handshake')) {
//       throw new HttpException(
//         `RasPi 서버와의 연결이 타임아웃되었습니다. RasPi 서버가 실행 중인지 확인해주세요: ${error.message}`,
//         HttpStatus.GATEWAY_TIMEOUT,
//       );
//     }

//     if (typeof error === 'string' && error.includes('No network with SSID')) {
//       throw new HttpException(
//         `입력하신 SSID를 주변에서 찾을 수 없습니다.`,
//         HttpStatus.UNPROCESSABLE_ENTITY,
//       );
//     }

//     console.error(error, 'error');

//     // 기본 에러 처리
//     const errorMessage =
//       error instanceof Error ? error.message : 'Unknown error occurred';

//     throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
//   }
// }
