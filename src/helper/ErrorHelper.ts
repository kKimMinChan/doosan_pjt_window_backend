import { HttpException, HttpStatus } from '@nestjs/common';
import {
  DuplicateDateError,
  ResourceNotFoundError,
} from 'src/check-sheet/check-sheet.repository';

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
