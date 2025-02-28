import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CheckSheetPaginationDto, Item } from './dto/check-sheet.request';
import { CheckSheetMongoRepository } from './check-sheet.repository';
import { CheckItemMongoRepository } from 'src/check-item/check-item.repository';
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
      const date = new Date();
      const latestCheckSheet = await this.checkSheetRepository.findOneLatest(
        checkSheetDto?.heavyEquipment,
      );

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

      // const parsedImageInfo = JSON.parse(checkSheetDto?.imageInfo ?? null);
      const parsedFileInfo =
        checkSheetDto?.fileInfo?.map((item) => JSON.parse(item)) ?? [];

      const parsedExistingImages =
        checkSheetDto?.existingImage?.map((image) => JSON.parse(image)) ?? [];

      if (files?.length > parsedFileInfo?.length)
        throw new BadRequestException(
          '이미지 파일과 이미지 정보의 개수가 맞지 않습니다.',
        );

      const images =
        files.map((file, idx) => {
          const { title, index } = parsedFileInfo[idx];
          return {
            title,
            index,
            url:
              process.env.NODE_ENV === 'production'
                ? `${file.path}`
                : `https://${process.env.CLOUDFRONT_URL}/${file.key}`,
          };
        }) || [];

      const finalImages = [...images, ...parsedExistingImages];

      // console.log(finalImages);

      const newCheckSheet = {
        ...checkSheetDto,
        items,
        images: finalImages,
      };

      console.log(newCheckSheet, 'newCheckSheet');

      return await this.checkSheetRepository.create(newCheckSheet);
    } catch (error) {
      console.error(error);
      ErrorHelper.handleError(error);
    }
  }

  async findAll(id: string, checkSheetPaginationDto: CheckSheetPaginationDto) {
    try {
      const { limit, page, sort, inspectionStatus, startDay, endDay } =
        checkSheetPaginationDto;

      console.log(id, 'findAll id');
      const latestCheckSheet =
        await this.checkSheetRepository.findOneLatest(id);

      if (!latestCheckSheet)
        return { translate: '생성된 체크시트가 없습니다.' };

      const kstLatestCheckSheet = {
        ...latestCheckSheet?.toJSON(),
        createdAt: new Date(
          latestCheckSheet?.createdAt?.getTime() + 9 * 60 * 60 * 1000,
        )?.toISOString(),
        updatedAt: new Date(
          latestCheckSheet?.updatedAt?.getTime() + 9 * 60 * 60 * 1000,
        )?.toISOString(),
      };

      const date = new Date().toISOString();

      const todaySkip =
        kstLatestCheckSheet?.createdAt.split('T')[0] === date.split('T')[0] &&
        !startDay;

      const skip = (page - 1) * limit;

      // console.log(skip, 'skip');

      const [data, totalCount] = await Promise.all([
        this.checkSheetRepository.findAll(
          id,
          skip,
          limit,
          sort,
          todaySkip,
          inspectionStatus,
          startDay,
          endDay,
        ),
        this.checkSheetRepository.countCheckSheet(
          id,
          todaySkip,
          inspectionStatus,
          startDay,
          endDay,
        ),
      ]);

      console.log(data, 'wefion');

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
      console.log(checkSheet, 'findOne');
      return checkSheet;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findOneLatest(id: string) {
    try {
      const latest = await this.checkSheetRepository.findOneLatest(id);
      console.log(latest, 'findOneLatest');
      return latest;
      // if (!latest)
      //   throw new NotFoundException('생성된 안전 점검표가 없습니다.');
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findOneLatestIssue(id: string) {
    try {
      const latest = await this.checkSheetRepository.findOneLatest(id);
      if (!latest) return [];
      const date = new Date();
      const kstCreatedAt = new Date(
        latest?.createdAt.getTime() + 9 * 60 * 60 * 1000,
      )?.toISOString();

      const isToday =
        date.toISOString().split('T')[0] === kstCreatedAt?.split('T')[0];
      const issue = await this.checkSheetRepository.findOneLatestIssue(
        id,
        isToday,
      );
      console.log(issue, 'findOneLatestIssue');
      return issue;
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
      console.log(
        date.toISOString().split('T')[0],
        checkSheet.createdAt.toISOString().split('T')[0],
      );
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
      // console.log(parsedItems);
      const checkItems = parsedItems.map((item) => item.checkItem);
      const checkItemIds = await this.checkItemRepository.create(checkItems);

      const items = checkItemIds.map((id, index) => ({
        checkItem: String(id),
        isOk: parsedItems[index].isOk,
      }));

      const parsedFileInfo =
        body?.fileInfo?.map((item) => JSON.parse(item)) ?? [];

      if (files?.length > parsedFileInfo?.length)
        throw new BadRequestException(
          '이미지 파일과 이미지 정보의 개수가 맞지 않습니다.',
        );
      console.log(parsedFileInfo);
      const isOkFileInfos = parsedFileInfo?.filter((info) => info.exist);
      const deleteFileInfos = parsedFileInfo?.filter((info) => !info.exist);
      const images =
        files?.map((file, idx) => {
          const { title, index } = isOkFileInfos[idx];
          return {
            title,
            index,
            url: `https://${process.env.CLOUDFRONT_URL}/${file.key}`,
          };
        }) || [];

      deleteFileInfos?.map((info) => images.push(info));

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
