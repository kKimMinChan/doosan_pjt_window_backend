import { HttpException, HttpStatus } from '@nestjs/common';
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
  static handleError(error: Error): never {
    if (error instanceof HttpException) {
      // ✅ getStatus()가 없으면 500으로 처리
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

    if (error.message.includes('Cast to ObjectId')) {
      throw new HttpException(
        `잘못된 ID 형식입니다. 유효한 ObjectId를 제공해주세요 : ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // ✅ ObjectId 형식 오류 검출
    if (
      error.message.includes('Cast to ObjectId') ||
      error.message.includes('input must be a 24 character hex string')
    ) {
      throw new HttpException(
        `잘못된 ID 형식입니다. 유효한 ObjectId를 제공해주세요: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    console.error(error);

    // 기본 에러 처리
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
