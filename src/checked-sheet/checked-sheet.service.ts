import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CheckedItemRequest, DateDto } from './dto/checked-sheet.request';
import {
  CheckedSheetMongoRepository,
  DuplicateDateError,
  ResourceNotFoundError,
} from './checked-sheet.repository';
import { validateSync } from 'class-validator';
import { CheckedSheet } from './entities/checked-sheet.schema';
import { CheckSheetMongoRepository } from 'src/check-sheet/check-sheet.repository';
import { usersMongoRepository } from 'src/admin/user/user.repository';
import { ErrorHelper } from 'src/helper/ErrorHelper';
import { PaginationDto } from 'src/common-dto/pagination.dto';

@Injectable()
export class CheckedSheetService {
  constructor(
    private checkedSheetRepository: CheckedSheetMongoRepository,
    private checkSheetRepository: CheckSheetMongoRepository,
    private usersRepository: usersMongoRepository,
  ) {}

  async create(id: string, body: CheckedItemRequest) {
    try {
      const checkSheet = await this.checkSheetRepository.findOne(id);
      if (!checkSheet) {
        throw new HttpException(
          '해당 체크 시트를 찾을 수 없습니다.',
          HttpStatus.NOT_FOUND,
        );
      }

      const heavyEquipmentId = checkSheet.heavyEquipmentId;

      const inspector = await this.usersRepository.findRole(
        heavyEquipmentId,
        '점검자',
      );
      const reviewer = await this.usersRepository.findRole(
        heavyEquipmentId,
        '확인자',
      );

      console.log(inspector, reviewer);

      if (!inspector || !reviewer) {
        throw new HttpException(
          '점검자 또는 확인자를 찾을 수 없습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const newCheckedSheet = {
        checkedItems: body.checkedItems,
        issue: body.issue,
        date: new Date().toISOString(),
        checkSheetId: id,
        inspectorId: inspector.id as string,
        reviewerId: reviewer.id as string,
      };

      console.log(newCheckedSheet, 'checksheet');

      return await this.checkedSheetRepository.create(newCheckedSheet);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit, page } = paginationDto;

      const skip = (page - 1) * limit;

      const [data, totalCount] = await Promise.all([
        this.checkedSheetRepository.findAll(skip, limit),
        this.checkedSheetRepository.countCheckedSheet(),
      ]);

      return {
        pageSize: limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        page,
        data,
      };
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findOne(id: string) {
    try {
      // const dateDto = new DateDto();
      // dateDto.date = date;

      // const errors = validateSync(dateDto); // class-validator의 validateSync를 사용
      // if (errors.length > 0) {
      //   const customMessage =
      //     errors
      //       .map((err) =>
      //         err.constraints
      //           ? Object.values(err.constraints).join(', ')
      //           : 'Invalid value',
      //       )
      //       .join(', ') || '날짜 형식은 YYYY-MM-DD이어야 합니다.';
      //   throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
      // }

      return await this.checkedSheetRepository.findOne(id);
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
