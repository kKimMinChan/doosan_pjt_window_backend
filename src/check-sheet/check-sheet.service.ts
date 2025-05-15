import {
  BadRequestException,
  ConflictException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CheckSheetPaginationDto,
  IssueStatus,
  Item,
} from './dto/check-sheet.request';
import { CheckSheetMongoRepository } from './check-sheet.repository';
import { CheckItemMongoRepository } from 'src/check-item/check-item.repository';
import { ErrorHelper } from 'src/helper/ErrorHelper';
import mongoose from 'mongoose';
import { usersMongoRepository } from 'src/admin/user/user.repository';
import { HeavyEquipmentMongoRepository } from 'src/heavy-equipment/heavy-equipment.repository';
import { filterTodayData } from 'src/lib/filterTodayData';

@Injectable()
export class CheckSheetService {
  constructor(
    private checkSheetRepository: CheckSheetMongoRepository,
    private checkItemRepository: CheckItemMongoRepository,
    private userRepository: usersMongoRepository,
    private heavyEquipmentRepository: HeavyEquipmentMongoRepository,
  ) {}
  async create(checkSheetDto: any, files: Express.MulterS3.File[]) {
    try {
      // 중장비 id 확인
      const isEquipment = await this.heavyEquipmentRepository.findOne(
        checkSheetDto?.equipment,
      );

      if (!isEquipment)
        throw new NotFoundException('해당 장비가 존재하지 않습니다.');

      const latestCheckSheet = await this.checkSheetRepository.findOneLatest(
        checkSheetDto?.equipment,
      );

      const todayCheckSheet = filterTodayData(latestCheckSheet);
      if (todayCheckSheet)
        throw new ConflictException('금일 데이터가 존재합니다.');

      // 사용자 id 확인
      const users = [checkSheetDto?.inspector, checkSheetDto?.reviewer];
      const missingUsers = await this.userRepository.findMissingUsers(users);

      if (missingUsers.length > 0) {
        throw new NotFoundException(
          `존재하지 않는 사용자가 있습니다. ${missingUsers.join(', ')}`,
        );
      }

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

      console.log(parsedFileInfo, 'parsedFileInfo', files?.length);
      if (files?.length > parsedFileInfo?.length)
        throw new BadRequestException(
          '이미지 파일과 이미지 정보의 개수가 맞지 않습니다.',
        );

      const images =
        files.map((file, idx) => {
          const { title, index } = parsedFileInfo[idx];
          console.log(file.key, 'file key');
          return {
            title,
            index,
            url:
              process.env.NODE_ENV === 'production'
                ? `${file.path}`
                : `${file.key}`,
          };
        }) || [];

      const finalImages = [...images, ...parsedExistingImages];

      console.log(
        finalImages,
        'finalImages ------------------------------------------------------',
      );

      const newCheckSheet = {
        ...checkSheetDto,
        items,
        images: finalImages,
      };

      // console.log(newCheckSheet, 'newCheckSheet');

      return await this.checkSheetRepository.create(newCheckSheet);
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findAll(id: string, checkSheetPaginationDto: CheckSheetPaginationDto) {
    try {
      const { limit, page, order, inspectionStatus, startDay, endDay } =
        checkSheetPaginationDto;

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
          order,
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

      // console.log(data, 'data ---------');

      console.log('findAll check-sheet-service');

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
      console.log('findOne');
      return checkSheet;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findOneLatest(id: string) {
    try {
      await this.heavyEquipmentRepository.findOne(id);

      const latest = await this.checkSheetRepository.findOneLatest(id);

      // console.log('findOneLatest', latest);

      return latest;
      // if (!latest)
      //   throw new NotFoundException('생성된 안전 점검표가 없습니다.');
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findOneLatestIssue(id: string) {
    try {
      await this.heavyEquipmentRepository.findOne(id);
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
      return issue;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async updateIssueStatus(id: string, body: IssueStatus) {
    try {
      return await this.checkSheetRepository.updateIssueStatus(
        id,
        body.isSolved,
      );
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async update(id: string, body: any, files: Express.MulterS3.File[]) {
    try {
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

      const parsedItems = JSON.parse(body?.items || '[]');
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
      const isOkFileInfos = parsedFileInfo?.filter((info) => info.exist);
      const deleteFileInfos = parsedFileInfo?.filter((info) => !info.exist);
      const images =
        files?.map((file, idx) => {
          const { title, index } = isOkFileInfos[idx];
          return {
            title,
            index,
            url:
              process.env.NODE_ENV === 'production'
                ? `${file.path}`
                : `${file.key}`,
          };
        }) || [];

      deleteFileInfos?.map((info) => images.push(info));

      const updateDto = {
        items,
        issue: body.issue,
        isSolved: body.issue ? false : null,
        images,
        inspector: body.inspector,
        reviewer: body.reviewer,
        heavyEquipment: body.heavyEquipment,
      };

      console.log(updateDto, 'update ------------------------------');

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
