import { BadRequestException, Injectable } from '@nestjs/common';
import { CheckSheet, CheckSheetDocument } from './entities/check-sheet.schema';
import mongoose, { Model } from 'mongoose';
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
  findAll(id: string, skip: number, limit: number);
  countCheckSheet(id: string);
  update(id: string, updateDto: Partial<CheckSheet>);
  remove(id: string);
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

    return checkSheet;
  }

  async findAll(id: string, skip: number, limit: number) {
    const checkSheets = await this.checkSheetModel
      .find({ heavyEquipment: new mongoose.Types.ObjectId(id) })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.checkItem');
    return checkSheets;
  }

  async countCheckSheet(id: string) {
    return this.checkSheetModel
      .countDocuments({ heavyEquipment: new mongoose.Types.ObjectId(id) })
      .exec();
  }

  async update(id: string, updateDto: Partial<CheckSheet>) {
    // ✅ 업데이트할 필드만 동적으로 선택
    const updateFields: Partial<CheckSheet> = {};

    if (updateDto.items) {
      updateFields.items = updateDto.items;
    }
    if (updateDto.images.length > 0) {
      console.log(updateDto);
      updateFields.images = updateDto.images;
    }
    if (updateDto.issue) {
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
}
