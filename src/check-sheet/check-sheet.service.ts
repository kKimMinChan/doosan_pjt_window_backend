import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CheckSheetRequest,
  Item,
  UpdateCheckSheetRequest,
} from './dto/check-sheet.request';
import { CheckSheetMongoRepository } from './check-sheet.repository';
import { CheckItemMongoRepository } from 'src/check-item/check-item.repository';
import { CheckSheet } from './entities/check-sheet.schema';
import { PaginationDto } from 'src/common-dto/pagination.dto';
import { ErrorHelper } from 'src/helper/ErrorHelper';
import mongoose from 'mongoose';

@Injectable()
export class CheckSheetService {
  constructor(
    private checkSheetRepository: CheckSheetMongoRepository,
    private checkItemRepository: CheckItemMongoRepository,
  ) {}
  async create(checkSheetDto: any, files: Express.MulterS3.File[]) {
    try {
      if (checkSheetDto?.items === undefined)
        throw new BadRequestException('items가 존재하지 않습니다.');
      const parsedCheckItems = JSON.parse(checkSheetDto?.items) as Item[];

      const checkItems = parsedCheckItems.map((item) => item.checkItem);
      const checkItemIds = await this.checkItemRepository.create(checkItems);

      const items = checkItemIds.map((id, index) => ({
        checkItem: String(id),
        isOk: parsedCheckItems[index].isOk,
      }));

      const images = files.map((file) => {
        if (file.fieldname.split('_').length !== 2)
          throw new BadRequestException('이미지 필드 이름이 잘못됐습니다.');
        const [title, index] = decodeURIComponent(file.fieldname).split('_');
        const indexToNum = Number(index);
        return {
          title,
          index: indexToNum,
          url: `https://${process.env.CLOUDFRONT_URL}/${file.key}`,
        };
      });

      const newCheckSheet = {
        ...checkSheetDto,
        items,
        images,
      };

      console.log(newCheckSheet);

      return await this.checkSheetRepository.create(newCheckSheet);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findAll(id: string, paginationDto: PaginationDto) {
    try {
      const { limit, page } = paginationDto;

      const skip = (page - 1) * limit;

      const [data, totalCount] = await Promise.all([
        this.checkSheetRepository.findAll(id, skip, limit),
        this.checkSheetRepository.countCheckSheet(id),
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
    return await this.checkSheetRepository.findOne(id);
  }

  async findOneLatest(id: string) {
    return await this.checkSheetRepository.findOneLatest(id);
  }

  async update(id: string, body: any, files: Express.MulterS3.File[]) {
    try {
      if (body?.items === undefined)
        throw new BadRequestException('items가 존재하지 않습니다.');

      const checkSheet = await this.checkSheetRepository.noPopulateFindOne(id);
      if (!checkSheet) {
        throw new NotFoundException(`CheckSheet를 찾을 수 없습니다.`);
      }

      const date = new Date();
      if (
        date.toISOString().split('T')[0] !==
        checkSheet.createdAt.toISOString().split('T')[0]
      ) {
        throw new HttpException(
          '오늘 작성된 안전점검표만 수정할 수 있습니다.',
          HttpStatus.FORBIDDEN, // 403 Forbidden
        );
      }

      const checkSheetCheckItems = checkSheet.items.map((item) =>
        item.checkItem.toString(),
      );

      const parsedItems = JSON.parse(body.items);
      const updateDtoCheckItems = parsedItems?.map((item) =>
        item.checkItem.toString(),
      );
      console.log(parsedItems, checkSheetCheckItems, updateDtoCheckItems);

      // ✅ 두 배열이 완전히 같은지 확인
      // const isSame =
      //   JSON.stringify(checkSheetCheckItems.sort()) ===
      //   JSON.stringify(updateDtoCheckItems.sort());

      // console.log(isSame); // true 또는 false
      // if (!isSame) throw new BadRequestException('')

      const images =
        files.map((file) => {
          if (file.fieldname.split('_').length !== 2)
            throw new BadRequestException('이미지 필드 이름이 잘못됐습니다.');
          const [title, index] = decodeURIComponent(file.fieldname).split('_');
          const indexToNum = Number(index);
          return {
            title,
            index: indexToNum,
            url: `${process.env.CLOUDFRONT_URL}/${file.key}`,
          };
        }) || [];

      const updateDto: UpdateCheckSheetRequest = {
        items: parsedItems,
        issue: body.issue ?? '',
        images,
      };

      // if (isSame) return await this.checkSheetRepository.update(id, updateDto);
      return await this.checkSheetRepository.update(id, updateDto);
      // return await this.checkSheetRepository.update(id, updateDto);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async remove(id: string) {
    return await this.checkSheetRepository.remove(id);
  }
}
