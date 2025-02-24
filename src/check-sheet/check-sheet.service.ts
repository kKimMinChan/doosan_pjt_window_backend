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
      const parsedCheckItems =
        (JSON.parse(checkSheetDto?.items) as Item[]) ?? [];

      const checkItems = parsedCheckItems.map((item) => item.checkItem);
      const checkItemIds = await this.checkItemRepository.create(checkItems);

      const items = checkItemIds.map((id, index) => ({
        checkItem: String(id),
        isOk: parsedCheckItems[index].isOk,
      }));
      console.log(checkSheetDto.imageInfo[0], checkSheetDto.imageInfo[1]);
      // const parsedImageInfo = JSON.parse(checkSheetDto?.imageInfo ?? null);
      const parsedImageInfo =
        checkSheetDto?.imageInfo?.map((item) => JSON.parse(item)) ?? [];

      if (files?.length > parsedImageInfo?.length)
        throw new BadRequestException(
          '이미지 파일과 이미지 정보의 개수가 맞지 않습니다.',
        );

      const images =
        files.map((file, idx) => {
          const { title, index } = parsedImageInfo[idx];
          return {
            title,
            index,
            url: `https://${process.env.CLOUDFRONT_URL}/${file.key}`,
          };
        }) || [];

      console.log(images);

      const newCheckSheet = {
        ...checkSheetDto,
        items,
        images,
      };

      console.log(newCheckSheet);

      return await this.checkSheetRepository.create(newCheckSheet);
    } catch (error) {
      console.error(error);
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

      const date = new Date().toISOString();

      const latestCheckSheet =
        await this.checkSheetRepository.findOneLatest(id);
      console.log(latestCheckSheet.createdAt.split('T')[0], date.split('T')[0]);

      if (latestCheckSheet.createdAt.split('T')[0] === date.split('T')[0]) {
        return {
          pageSize: limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          page,
          data: data.filter((sheet) => sheet.id !== latestCheckSheet.id),
        };
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

  async findOne(id: string) {
    try {
      const checkSheet = await this.checkSheetRepository.findOne(id);

      // if (!checkSheet)
      //   throw new NotFoundException(
      //     '해당 id의 안전점검표가 존재하지 않습니다.',
      //   );

      return checkSheet;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findOneLatest(id: string) {
    try {
      const latest = await this.checkSheetRepository.findOneLatest(id);
      return latest;
      // if (!latest)
      //   throw new NotFoundException('생성된 안전 점검표가 없습니다.');
    } catch (error) {
      ErrorHelper.handleError(error);
    }
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

      const parsedItems = JSON.parse(body.items);
      console.log(parsedItems);
      const checkItems = parsedItems.map((item) => item.checkItem);
      const checkItemIds = await this.checkItemRepository.create(checkItems);

      const items = checkItemIds.map((id, index) => ({
        checkItem: String(id),
        isOk: parsedItems[index].isOk,
      }));

      const parsedImageInfo =
        body?.imageInfo?.map((item) => JSON.parse(item)) ?? [];

      if (files?.length > parsedImageInfo?.length)
        throw new BadRequestException(
          '이미지 파일과 이미지 정보의 개수가 맞지 않습니다.',
        );
      console.log(parsedImageInfo);
      const isOkImageInfos = parsedImageInfo?.filter((info) => info.exist);
      const deleteImageInfos = parsedImageInfo?.filter((info) => !info.exist);
      const images =
        files?.map((file, idx) => {
          const { title, index } = isOkImageInfos[idx];
          return {
            title,
            index,
            url: `https://${process.env.CLOUDFRONT_URL}/${file.key}`,
          };
        }) || [];

      deleteImageInfos?.map((info) => images.push(info));

      const updateDto = {
        items,
        issue: body.issue,
        images,
      };

      console.log(updateDto);

      return await this.checkSheetRepository.update(id, updateDto);
    } catch (error) {
      console.log(error);

      ErrorHelper.handleError(error);
    }
  }

  async remove(id: string) {
    try {
      return await this.checkSheetRepository.remove(id);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async removeAll() {
    try {
      return await this.checkSheetRepository.removeAll();
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }
}
