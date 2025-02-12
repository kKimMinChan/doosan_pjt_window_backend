import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CheckSheetMongoRepository } from './check-sheet.repository';
import {
  CheckItemRequest,
  CheckItemsRequest,
  CheckSheetRequest,
  DateDto,
  UpdateCheckItem,
} from './check-sheet-request.dto';
import { validate, validateSync } from 'class-validator';
import mongoose from 'mongoose';
import {
  DuplicateDateError,
  ErrorHelper,
  ResourceNotFoundError,
} from 'src/helper/ErrorHelper';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from 'src/common-dto/pagination.dto';
import { HeavyEquipmentMongoRepository } from 'src/heavy-equipment/heavy-equipment.repository';

@Injectable()
export class CheckSheetService {
  constructor(
    private checkSheetRepository: CheckSheetMongoRepository,
    private heavyEquipmentRepository: HeavyEquipmentMongoRepository,
  ) {}

  async findOne(type: string) {
    try {
      return await this.checkSheetRepository.findOne(type);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findOneCheckItem(id: string) {
    try {
      return await this.checkSheetRepository.findOneCheckItem(id);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async updateOneCheckItem(id: string, checkItemDto: UpdateCheckItem) {
    try {
      await this.checkSheetRepository.updateOneCheckItem(id, checkItemDto);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async createCheckItem(
    type: '지게차' | '대차' | '크레인',
    checkItemDto: CheckItemRequest,
  ) {
    try {
      const result = await this.checkSheetRepository.createCheckItem(
        type,
        checkItemDto,
      );
      return result;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async removeCheckItem(id: string) {
    try {
      const result = await this.checkSheetRepository.removeCheckItem(id);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit, page } = paginationDto;

      const skip = (page - 1) * limit;

      const [data, totalCount] = await Promise.all([
        this.checkSheetRepository.findAll(skip, limit),
        this.checkSheetRepository.countCheckSheet(),
      ]);

      if (!data) {
        // 데이터가 없는 경우 404 상태와 메시지 반환
        throw new HttpException(
          '작업 안전 점검표 데이터가 없습니다. 작업 안전 점검표 데이터를 추가해주세요.',
          HttpStatus.NOT_FOUND,
        );
      }
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

  async findAllCheckItems(type: '지게차' | '대차' | '크레인') {
    try {
      return await this.checkSheetRepository.findAllCheckItems(type);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async createCheckItems(
    type: '지게차' | '대차' | '크레인',
    body: CheckItemsRequest,
  ) {
    try {
      const exist = await this.checkSheetRepository.isExistType(type);
      if (exist) {
        throw new ConflictException(`이미 존재하는 유형입니다: ${type}`);
      }
      const checkItems = JSON.parse(JSON.stringify(body.checkItems, null, 2));

      // 유효성 검사
      const errors = await validate(checkItems);
      if (errors.length > 0) {
        console.error('유효성 검사 실패:', errors);
        throw new BadRequestException('유효성 검사에 실패했습니다.');
      }

      const checkSheetDto = {
        checkItems,
        type,
      };

      const CreatedCheckSheet =
        await this.checkSheetRepository.createCheckSheet({
          ...checkSheetDto,
        });
      return CreatedCheckSheet;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async updateCheckItems(
    type: '지게차' | '대차' | '크레인',
    body: CheckItemsRequest,
  ) {
    try {
      const exist = await this.checkSheetRepository.isExistType(type);
      if (!exist) {
        throw new NotFoundException(
          `데이터가 존재하지 않습니다. 요청한 유형: ${type}`,
        );
      }
      const checkItems = JSON.parse(JSON.stringify(body.checkItems, null, 2));

      // 유효성 검사
      const errors = await validate(checkItems);
      if (errors.length > 0) {
        console.error('유효성 검사 실패:', errors);
        throw new BadRequestException('유효성 검사에 실패했습니다.');
      }

      const checkSheetDto = {
        checkItems,
        type,
      };

      const CreatedCheckSheet =
        await this.checkSheetRepository.createCheckSheet({
          ...checkSheetDto,
        });
      return CreatedCheckSheet;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async createCheckSheetInfo(
    type: '지게차' | '대차' | '크레인',
    body: any,
    files: Express.Multer.File[],
  ): Promise<any> {
    try {
      console.log(body.checkItems);
      await this.checkSheetRepository.isExistType(type);
      // JSON 문자열 파싱
      let parsedCheckItems =
        typeof body.checkItems === 'string'
          ? JSON.parse(body.checkItems)
          : body.checkItems;

      // DTO 인스턴스로 변환
      const requestInstance = plainToInstance(CheckSheetRequest, {
        checkItems: parsedCheckItems,
        files,
        type,
      });
      console.log(parsedCheckItems);
      // 유효성 검사
      const errors = await validate(requestInstance);
      if (errors.length > 0) {
        console.error('유효성 검사 실패:', errors);
        throw new BadRequestException('유효성 검사에 실패했습니다.');
      }

      // const existingIndexes = new Set();
      // for (const item of parsedCheckItems) {
      //   if (existingIndexes.has(item.index)) {
      //     throw new ConflictException(
      //       `중복된 index 값이 존재합니다: ${item.index}`,
      //     );
      //   }
      //   existingIndexes.add(item.index);
      // }

      // const isHeavyEquipment = await this.heavyEquipmentRepository.findOne(
      //   heavyEquipmentId,
      // );

      // if (!isHeavyEquipment) {
      //   throw new HttpException(
      //     '해당 id의 중장비가 존재하지 않습니다.',
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }

      // const isCheckSheet = await this.checkSheetRepository.isCheckSheet(
      //   heavyEquipmentId,
      // );

      // if (isCheckSheet) {
      //   throw new HttpException(
      //     '해당 id로 생성된 체크 시트가 존재합니다.',
      //     HttpStatus.CONFLICT,
      //   );
      // }

      // 이미지 URL 생성
      const imageUrls = files.map((file) => file.path);
      if (imageUrls.length > 4) {
        throw new HttpException(
          '안전 점검표 이미지는 최대 4장까지 업로드 가능합니다.',
          HttpStatus.BAD_REQUEST,
        );
      }
      const checkSheetDto = {
        checkItems: parsedCheckItems,
        imageUrls,
        type,
      };

      const CreatedCheckSheet =
        await this.checkSheetRepository.createCheckSheet({
          ...checkSheetDto,
        });
      return CreatedCheckSheet;
    } catch (error) {
      console.error(error);
      ErrorHelper.handleError(error);
    }
  }

  // async updateCheckSheet(
  //   id: string,
  //   body: any,
  //   files: Express.Multer.File[],
  // ): Promise<any> {
  //   try {
  //     // const parsedCheckSheetInfo = JSON.parse(checkSheetInfo);
  //     // const parsedCheckLists = JSON.parse(checkLists);
  //     // const parsedImages = images ? JSON.parse(images) : [];
  //     const parsedCheckLists =
  //       typeof body.checkLists === 'string'
  //         ? JSON.parse(body.checkLists)
  //         : body.checkLists;

  //     // const parsedImages: string[] = JSON.parse(body.imageUrls);
  //     const parsedImages: string[] =
  //       body.imageUrls && typeof body.imageUrls === 'string'
  //         ? body.imageUrls.split(',')
  //         : body.imageUrls
  //           ? JSON.parse(body.imageUrls)
  //           : [];

  //     // 이미지 URL 생성
  //     const imageUrls = files.map((file) => file.path);

  //     const checkSheetDto: any = {
  //       checkLists: parsedCheckLists,
  //     };

  //     checkSheetDto.imageUrls = [...parsedImages, ...imageUrls];

  //     // parsedImages와 imageUrls 둘 다 없으면 필드 제거
  //     if (checkSheetDto.imageUrls.length === 0) {
  //       delete checkSheetDto.imageUrls;
  //     }

  //     if (checkSheetDto?.imageUrls?.length > 4) {
  //       throw new HttpException(
  //         '안전 점검표 이미지는 최대 4장까지 업로드 가능합니다.',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }

  //     const isCheckSheet = await this.findOne(id);

  //     if (!isCheckSheet) {
  //       throw new HttpException(
  //         '해당 id의 체크 시트가 존재하지 않습니다.',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }

  //     const result = await this.checkSheetRepository.update(id, checkSheetDto);

  //     return result;
  //   } catch (error) {
  //     ErrorHelper.handleError(error);
  //   }
  // }

  // async createCheckedList(createCheckedListDto: CheckedListDto) {
  //   try {
  //     return await this.checkSheetRepository.createCheckedList(
  //       createCheckedListDto,
  //     );
  //   } catch (error) {
  //     console.error(error);

  //     if (error instanceof DuplicateDateError) {
  //       throw new HttpException(error.message, HttpStatus.CONFLICT);
  //     }
  //     if (error instanceof ResourceNotFoundError) {
  //       throw new HttpException(error.message, HttpStatus.NOT_FOUND);
  //     }

  //     throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  async findCheckedLists() {
    try {
      const checkedLists = await this.checkSheetRepository.findCheckedLists();

      // if (!checkedLists.checkedLists || checkedLists.checkedLists.length === 0)
      //   throw new ResourceNotFoundError(
      //     'CheckedLists 데이터가 존재하지 않습니다.',
      //   );

      // return checkedLists.checkedLists;
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findCheckedList(date: string) {
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

      const findList = await this.checkSheetRepository.findCheckedList(date);

      // if (!findList) {
      //   throw new ResourceNotFoundError(
      //     '해당 날짜의 CheckedLists 데이터가 존재하지 않습니다.',
      //   );
      // }

      return findList;
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

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // async updateCheckedList(_id: string, checkedListDto: CheckedListDto) {
  //   try {
  //     return await this.checkSheetRepository.updateCheckedList(
  //       _id,
  //       checkedListDto,
  //     );
  //   } catch (error) {
  //     console.error(error.message, error);
  //     if (
  //       error instanceof ResourceNotFoundError ||
  //       error.name === 'ResourceNotFoundError'
  //     ) {
  //       throw new HttpException(error.message, HttpStatus.NOT_FOUND);
  //     }

  //     if (error instanceof mongoose.Error.CastError && error.path === '_id') {
  //       throw new HttpException(
  //         '잘못된 ID 형식입니다. 유효한 ObjectId를 제공해주세요.',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }

  //     throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  async removeCheckedLists() {
    try {
      return await this.checkSheetRepository.removeCheckedLists();
    } catch (error) {
      console.error(error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async removeCheckedList(_id: string) {
    try {
      return await this.checkSheetRepository.removeCheckedList(_id);
    } catch (error) {
      console.error(error.message);
      if (
        error instanceof ResourceNotFoundError ||
        error.name === 'ResourceNotFoundError'
      ) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      if (error instanceof mongoose.Error.CastError && error.path === '_id') {
        throw new HttpException(
          '잘못된 ID 형식입니다. 유효한 ObjectId를 제공해주세요.',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
