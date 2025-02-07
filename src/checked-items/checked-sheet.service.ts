import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CheckedItemRequest, DateDto } from './dto/checked-sheet.request';
import {
  CheckedSheetMongoRepository,
  DuplicateDateError,
  ResourceNotFoundError,
} from './checked-sheet.repository';
import { validateSync } from 'class-validator';
import { CheckedSheet } from './entities/checked-sheet.schema';

@Injectable()
export class CheckedSheetService {
  constructor(private checkedSheetRepository: CheckedSheetMongoRepository) {}

  // async create(id: string, createCheckedListDto: CheckedItemRequest) {
  //   try {
  //     const createCheckedSheet: CheckedSheet = {
  //       checkSheetId: id,
  //       ...createCheckedListDto,
  //     };
  //     return await this.checkedSheetRepository.create(createCheckedListDto);
  //   } catch (error) {
  //     if (error instanceof DuplicateDateError) {
  //       throw new HttpException(error.message, HttpStatus.CONFLICT);
  //     }
  //     throw new HttpException(
  //       'Unexpected error occurred',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // async findAll() {
  //   try {
  //     return (await this.checkedSheetRepository.findAll()).checkedLists;
  //   } catch (error) {
  //     if (error instanceof ResourceNotFoundError) {
  //       throw new HttpException(error.message, HttpStatus.NOT_FOUND);
  //     }
  //     throw new HttpException(
  //       'Unexpected error occurred',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // async findOne(date: string) {
  //   try {
  //     const dateDto = new DateDto();
  //     dateDto.date = date;

  //     const errors = validateSync(dateDto); // class-validator의 validateSync를 사용
  //     if (errors.length > 0) {
  //       const customMessage =
  //         errors
  //           .map((err) =>
  //             err.constraints
  //               ? Object.values(err.constraints).join(', ')
  //               : 'Invalid value',
  //           )
  //           .join(', ') || '날짜 형식은 YYYY-MM-DD이어야 합니다.';
  //       throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
  //     }

  //     return await this.checkedSheetRepository.findOne(date);
  //   } catch (error) {
  //     console.error(error.message);
  //     if (
  //       error instanceof ResourceNotFoundError ||
  //       error.name === 'ResourceNotFoundError'
  //     ) {
  //       throw new HttpException(error.message, HttpStatus.NOT_FOUND);
  //     }

  //     // HttpException이 이미 발생했으면 그대로 다시 throw
  //     if (error instanceof HttpException) {
  //       throw error;
  //     }

  //     throw new HttpException(
  //       'Unexpected error occurred',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // async update(_id: string, checkedListDto: CheckedItemRequest) {
  //   try {
  //     return await this.checkedSheetRepository.update(_id, checkedListDto);
  //   } catch (error) {
  //     console.error(error.message);
  //     if (
  //       error instanceof ResourceNotFoundError ||
  //       error.name === 'ResourceNotFoundError'
  //     ) {
  //       throw new HttpException(error.message, HttpStatus.NOT_FOUND);
  //     }
  //     throw new HttpException(
  //       'Unexpected error occurred',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // async remove(_id: string) {
  //   try {
  //     return await this.checkedSheetRepository.remove(_id);
  //   } catch (error) {
  //     console.error(error.message);
  //     if (
  //       error instanceof ResourceNotFoundError ||
  //       error.name === 'ResourceNotFoundError'
  //     ) {
  //       throw new HttpException(error.message, HttpStatus.NOT_FOUND);
  //     }
  //     throw new HttpException(
  //       'Unexpected error occurred',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // async removeAll() {
  //   try {
  //     return await this.checkedSheetRepository.removeAll();
  //   } catch (error) {
  //     throw new HttpException(
  //       'Unexpected error occurred',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
}
