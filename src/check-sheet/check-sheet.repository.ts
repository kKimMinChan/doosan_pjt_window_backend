import { Injectable } from '@nestjs/common';
import { CheckSheet, CheckSheetDocument } from './entities/check-sheet.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

export interface CheckSheetRepository {
  create(checkSheetDto: CheckSheet);
  findOne(id: string);
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
}
