import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CheckedListDto, DateDto } from './dto/create-checked-list.dto';
import {
  CheckedListsMongoRepository,
  DuplicateDateError,
  ResourceNotFoundError,
} from './checked-lists.repository';
import { validateSync } from 'class-validator';

@Injectable()
export class CheckedListsService {
  constructor(private checkedListsRepository: CheckedListsMongoRepository) {}

  async create(createCheckedListDto: CheckedListDto) {
    try {
      return await this.checkedListsRepository.create(createCheckedListDto);
    } catch (error) {
      if (error instanceof DuplicateDateError) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(
        'Unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      return (await this.checkedListsRepository.findAll()).checkedLists;
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(date: string) {
    try {
      const dateDto = new DateDto();
      dateDto.date = date;

      const errors = validateSync(dateDto); // class-validator의 validateSync를 사용
      if (errors.length > 0) {
        const customMessage =
          errors
            .map((err) =>
              err.constraints
                ? Object.values(err.constraints).join(', ')
                : 'Invalid value',
            )
            .join(', ') || '날짜 형식은 YYYY-MM-DD이어야 합니다.';
        throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
      }

      return await this.checkedListsRepository.findOne(date);
    } catch (error) {
      console.error(error.message);
      if (
        error instanceof ResourceNotFoundError ||
        error.name === 'ResourceNotFoundError'
      ) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      // HttpException이 이미 발생했으면 그대로 다시 throw
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(_id: string, checkedListDto: CheckedListDto) {
    try {
      return await this.checkedListsRepository.update(_id, checkedListDto);
    } catch (error) {
      console.error(error.message);
      if (
        error instanceof ResourceNotFoundError ||
        error.name === 'ResourceNotFoundError'
      ) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(_id: string) {
    try {
      return await this.checkedListsRepository.remove(_id);
    } catch (error) {
      console.error(error.message);
      if (
        error instanceof ResourceNotFoundError ||
        error.name === 'ResourceNotFoundError'
      ) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeAll() {
    try {
      return await this.checkedListsRepository.removeAll();
    } catch (error) {
      throw new HttpException(
        'Unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
