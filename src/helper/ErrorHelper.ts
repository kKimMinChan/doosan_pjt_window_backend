import { HttpException, HttpStatus } from '@nestjs/common';

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
    if (error instanceof HttpException) {
      throw new HttpException(error.message, error.getStatus());
    }

    if (error instanceof DuplicateDateError) {
      throw new HttpException(error.message, HttpStatus.CONFLICT);
    }
    if (error instanceof ResourceNotFoundError) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }

    // 기본 에러 처리
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    throw new HttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
