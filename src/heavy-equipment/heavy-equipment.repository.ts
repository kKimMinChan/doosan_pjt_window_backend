import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  HeavyEquipment,
  HeavyEquipmentDocument,
} from './entities/heavy-equipment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ErrorHelper, ResourceNotFoundError } from 'src/helper/ErrorHelper';

export interface HeavyEquipmentRepository {
  createHeavyEquipment(heavyEquipmentInfo: HeavyEquipment);
  findOne(id: string);
  findAll();
  exists(ids: string[]);
  findAllPaginated(skip: number, limit: number);
  countEquipments();
  update(id: string, heavyEquipmentInfo: Partial<HeavyEquipment>);
  remove(id: string);
  findQuery(query: any);
}

@Injectable()
export class HeavyEquipmentMongoRepository implements HeavyEquipmentRepository {
  constructor(
    @InjectModel(HeavyEquipment.name)
    private heavyEquipmentModel: Model<HeavyEquipmentDocument>,
  ) {}

  async findQuery(query: any) {
    const equipments = await this.heavyEquipmentModel.find(query);
    return equipments;
  }

  async createHeavyEquipment(heavyEquipmentInfo: HeavyEquipment) {
    const document = new this.heavyEquipmentModel(heavyEquipmentInfo);
    return await document.save();
  }

  async findAll() {
    return await this.heavyEquipmentModel.find().sort({ _id: -1 });
  }

  async findAllPaginated(skip: number, limit: number) {
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
    const equipmentDocument = await this.heavyEquipmentModel
      .findById(id)
      .populate('inspectors reviewers');

    if (!equipmentDocument)
      throw new ResourceNotFoundError('등록된 중장비가 없습니다.');

    return equipmentDocument;
  }

  async exists(ids: string[]) {
    const count = await this.heavyEquipmentModel.countDocuments({
      _id: { $in: ids },
    });
    return count === ids?.length;
  }

  async update(id: string, heavyEquipmentInfo: Partial<HeavyEquipment>) {
    // const updateFields: Partial<HeavyEquipment> = {};
    // if (heavyEquipmentInfo.equipmentNumber)
    //   updateFields['equipmentNumber'] = heavyEquipmentInfo.equipmentNumber;
    // if (heavyEquipmentInfo.factoryName)
    //   updateFields['factoryName'] = heavyEquipmentInfo.factoryName;
    // // if (heavyEquipmentInfo.isDeleted)
    // //   updateFields['isDeleted'] = heavyEquipmentInfo.isDeleted;
    // if (heavyEquipmentInfo.type) updateFields['type'] = heavyEquipmentInfo.type;
    // if (heavyEquipmentInfo.inspectors?.length > 0)
    //   updateFields['inspectors'] = heavyEquipmentInfo.inspectors;
    // if (heavyEquipmentInfo.reviewers?.length > 0)
    //   updateFields['reviewers'] = heavyEquipmentInfo.reviewers;
    // if (heavyEquipmentInfo.drivers?.length > 0)
    //   updateFields['drivers'] = heavyEquipmentInfo.drivers;

    // if (Object.keys(updateFields).length === 0) {
    //   throw new Error('변경할 데이터가 없습니다.');
    // }

    // console.log(updateFields, 'updateFields');
    console.log(heavyEquipmentInfo, 'heavyEquipmentInfo');

    const result = await this.heavyEquipmentModel.updateOne(
      { _id: id },
      { $set: heavyEquipmentInfo },
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
    try {
      const result = await this.heavyEquipmentModel.deleteOne({ _id: id });
      if (result.deletedCount > 0) return result;
      return null;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }
}
