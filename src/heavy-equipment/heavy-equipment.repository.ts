import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  HeavyEquipment,
  HeavyEquipmentDocument,
} from './entities/heavy-equipment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface HeavyEquipmentRepository {
  createHeavyEquipment(heavyEquipmentInfo: HeavyEquipment);
  findOne(id: string);
  findAll(skip: number, limit: number);
  update(id: string, heavyEquipmentInfo: Partial<HeavyEquipment>);
  remove(id: string);
}

@Injectable()
export class HeavyEquipmentMongoRepository implements HeavyEquipmentRepository {
  constructor(
    @InjectModel(HeavyEquipment.name)
    private heavyEquipmentModel: Model<HeavyEquipmentDocument>,
  ) {}

  async createHeavyEquipment(heavyEquipmentInfo: HeavyEquipment) {
    const document = new this.heavyEquipmentModel(heavyEquipmentInfo);
    return await document.save();
  }

  async findAll(skip: number, limit: number) {
    return await this.heavyEquipmentModel
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countEquipments() {
    return this.heavyEquipmentModel.countDocuments().exec();
  }

  async findOne(id: string) {
    const equipmentDocument = await this.heavyEquipmentModel.findOne({
      _id: id,
    });
    return equipmentDocument;
  }

  async update(id: string, heavyEquipmentInfo: Partial<HeavyEquipment>) {
    const updateFields: Partial<HeavyEquipment> = {};
    if (heavyEquipmentInfo.equipmentNumber)
      updateFields['equipmentNumber'] = heavyEquipmentInfo.equipmentNumber;
    if (heavyEquipmentInfo.factoryName)
      updateFields['factoryName'] = heavyEquipmentInfo.factoryName;
    if (heavyEquipmentInfo.isDeleted)
      updateFields['isActive'] = heavyEquipmentInfo.isDeleted;
    if (heavyEquipmentInfo.type) updateFields['type'] = heavyEquipmentInfo.type;

    if (Object.keys(updateFields).length === 0) {
      throw new Error('변경할 데이터가 없습니다.');
    }

    const result = await this.heavyEquipmentModel.updateOne(
      { _id: id },
      { $set: updateFields },
    );

    if (result.modifiedCount === 0) {
      throw new HttpException(
        '업데이트가 이루어지지 않았습니다.',
        HttpStatus.CONFLICT,
      );
    }

    if (result.modifiedCount > 0) return result;
    return null;
  }

  async remove(id: string) {
    const result = await this.heavyEquipmentModel.deleteOne({ _id: id });
    if (result.deletedCount > 0) return result;
    return null;
  }
}
