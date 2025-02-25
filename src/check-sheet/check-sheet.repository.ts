import { BadRequestException, Injectable } from '@nestjs/common';
import { CheckSheet, CheckSheetDocument } from './entities/check-sheet.schema';
import mongoose, { Model, SortOrder } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  CheckItem,
  CheckItemDocument,
} from 'src/check-item/entities/check-item.schema';

export interface CheckSheetRepository {
  create(checkSheetDto: CheckSheet);
  findOne(id: string);
  noPopulateFindOne(id: string);
  findOneLatest(id: string);
  findAll(
    id: string,
    skip: number,
    limit: number,
    sort: number,
    inspectionStatus: string,
    startDay: string,
    endDay: string,
  );
  countCheckSheet(id: string, isToday: boolean);
  update(id: string, updateDto: Partial<CheckSheet>);
  remove(id: string);
  removeAll();
}

@Injectable()
export class CheckSheetMongoRepository implements CheckSheetRepository {
  constructor(
    @InjectModel(CheckSheet.name)
    private checkSheetModel: Model<CheckSheetDocument>,
    @InjectModel(CheckItem.name)
    private checkItemModel: Model<CheckItemDocument>,
  ) {}

  async create(checkSheetDto: CheckSheet) {
    const newCheckSheet = new this.checkSheetModel(checkSheetDto);
    return await newCheckSheet.save();
  }

  async findOne(id: string) {
    const checkSheet = await this.checkSheetModel
      .findOne({ _id: id })
      .populate('items.checkItem');
    return checkSheet;
  }

  async noPopulateFindOne(id: string) {
    const checkSheet = await this.checkSheetModel.findOne({ _id: id });
    return checkSheet;
  }

  async findOneLatest(id: string) {
    const checkSheet = await this.checkSheetModel
      .findOne({
        heavyEquipment: new mongoose.Types.ObjectId(id),
      }) // ✅ `ObjectId` 변환 후 비교
      .sort({ _id: -1 })
      .populate('items.checkItem') // ✅ 최신 데이터 우선 정렬
      .exec(); // ✅ `exec()` 호출하여 실행

    const kstCheckSheet = checkSheet
      ? {
          ...checkSheet.toJSON(),
          createdAt: new Date(
            checkSheet.createdAt.getTime() + 9 * 60 * 60 * 1000,
          ).toISOString(),
          updatedAt: new Date(
            checkSheet.updatedAt.getTime() + 9 * 60 * 60 * 1000,
          ).toISOString(),
        }
      : null;

    return kstCheckSheet;
  }

  async findAll(
    id: string,
    skip: number,
    limit: number,
    sort: number,
    inspectionStatus: string,
    startDay: string,
    endDay: string,
  ) {
    const sortOrder: SortOrder = [1, -1].includes(sort as number)
      ? (sort as SortOrder)
      : -1; // ✅ 안전한 변환

    const filter: any = { heavyEquipment: new mongoose.Types.ObjectId(id) };

    // ✅ 날짜가 있으면 필터 추가
    if (startDay) {
      filter.createdAt = { ...filter.createdAt, $gte: new Date(startDay) };
    }
    if (endDay) {
      filter.createdAt = { ...filter.createdAt, $lte: new Date(endDay) };
    }

    if (inspectionStatus === 'CHECKED') {
      filter['issue'] = { $ne: null };
    } else if (inspectionStatus === 'UNCHECKED') {
      filter['issue'] = null;
    }

    const checkSheets = await this.checkSheetModel
      .find(filter)
      .sort({ _id: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('items.checkItem');
    return checkSheets;
  }

  async countCheckSheet(id: string, isToday: boolean) {
    const totalCount = await this.checkSheetModel
      .countDocuments({ heavyEquipment: new mongoose.Types.ObjectId(id) })
      .exec();
    return isToday ? totalCount - 1 : totalCount;
  }

  async update(id: string, updateDto: Partial<CheckSheet>) {
    const checkSheet = await this.checkSheetModel.findById(id).exec();

    // ✅ 업데이트할 필드만 동적으로 선택
    const updateFields: Partial<CheckSheet> = {};

    if (updateDto.items) {
      updateFields.items = updateDto.items;
    }
    // ✅ `images` 업데이트 로직
    if (updateDto.images?.length > 0) {
      // 기존 `checkSheet.images`를 `index` 기반으로 빠르게 검색 가능하도록 변환
      const imageMap = new Map(
        checkSheet.images.map((image) => [image.index, image]),
      );

      // 업데이트할 images 순회
      updateDto.images.forEach((newImage) => {
        if (imageMap.has(newImage.index)) {
          // ✅ 기존 index가 존재하는 경우 업데이트
          imageMap.set(newImage.index, newImage);
        } else {
          // ✅ 새로운 index가 추가된 경우 유지
          imageMap.set(newImage.index, newImage);
        }
      });

      // ✅ 변경된 images 배열 업데이트
      updateFields.images = Array.from(imageMap.values());
    }
    if (updateDto.issue !== undefined) {
      updateFields.issue = updateDto.issue;
    }

    // ✅ 해당 `checkSheet` 찾고 업데이트
    const updatedCheckSheet = await this.checkSheetModel
      .findByIdAndUpdate(
        id,
        { $set: updateFields }, // ✅ 필드가 존재하는 경우만 업데이트
        { new: true, omitUndefined: true }, // ✅ 업데이트된 문서 반환 & undefined 필드 무시
      )
      .exec();

    return updatedCheckSheet;
  }

  async remove(id: string) {
    const result = await this.checkSheetModel.deleteOne({ _id: id });
    if (result.deletedCount > 0) return result;

    return null;
  }

  async removeAll() {
    const result = await this.checkSheetModel.deleteMany();
    return result;
  }
}
