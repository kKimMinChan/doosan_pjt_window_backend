import { Injectable } from '@nestjs/common';
import { CheckSheet, CheckSheetDocument } from './entities/check-sheet.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

export interface CheckSheetRepository {
  create(checkSheetDto: CheckSheet);
  findOne(id: string);
  findOneLatest(id: string);
  findAll(id: string, skip: number, limit: number);
  countCheckSheet(id: string);
}

@Injectable()
export class CheckSheetMongoRepository implements CheckSheetRepository {
  constructor(
    @InjectModel(CheckSheet.name)
    private checkSheetModel: Model<CheckSheetDocument>,
  ) {}

  async create(checkSheetDto: CheckSheet) {
    const newCheckSheet = new this.checkSheetModel(checkSheetDto);
    return await newCheckSheet.save();
  }

  async findOne(id: string) {
    const checkSheet = await this.checkSheetModel.findOne({ _id: id });
    return checkSheet;
  }

  async findOneLatest(id: string) {
    const checkSheet = await this.checkSheetModel
      .findOne({
        heavyEquipment: new mongoose.Types.ObjectId(id),
      }) // ✅ `ObjectId` 변환 후 비교
      .sort({ _id: -1 }) // ✅ 최신 데이터 우선 정렬
      .exec(); // ✅ `exec()` 호출하여 실행

    return checkSheet;
  }

  async findAll(id: string, skip: number, limit: number) {
    const checkSheets = await this.checkSheetModel
      .find({ heavyEquipment: new mongoose.Types.ObjectId(id) })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    return checkSheets;
  }

  async countCheckSheet(id: string) {
    return this.checkSheetModel
      .countDocuments({ heavyEquipment: new mongoose.Types.ObjectId(id) })
      .exec();
  }
}
