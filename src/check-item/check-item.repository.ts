import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CheckItem, CheckItemDocument } from './entities/check-item.schema';

export interface CheckItemRepository {
  create(checkItemDto: CheckItem[]);
  findAll(skip: number, limit: number);
  countCheckItems();
  findOne(id: string);
  update(id: string, checkItemDto: CheckItem);
  remove(id: string);
}

@Injectable()
export class CheckItemMongoRepository implements CheckItemRepository {
  constructor(
    @InjectModel(CheckItem.name)
    private checkItemModel: Model<CheckItemDocument>,
  ) {}

  async create(checkItemDto: CheckItem[]) {
    const newCheckItems = await this.checkItemModel.insertMany(checkItemDto);
    return newCheckItems;
  }

  async findAll(skip: number, limit: number) {
    const checkItems = await this.checkItemModel
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
    return checkItems;
  }

  async countCheckItems() {
    return this.checkItemModel.countDocuments().exec();
  }

  async findOne(id: string) {
    const checkItem = await this.checkItemModel.findOne({ _id: id });
    return checkItem;
  }

  async update(id: string, checkItemDto: Partial<CheckItem>) {
    const updateFields: Partial<CheckItem> = {};
    if (checkItemDto.content) updateFields['content'] = checkItemDto.content;
    if (checkItemDto.method) updateFields['method'] = checkItemDto.method;
    if (checkItemDto.type) updateFields['type'] = checkItemDto.type;

    if (Object.keys(updateFields).length === 0) {
      throw new Error('변경할 데이터가 없습니다.');
    }

    console.log(updateFields);

    const result = await this.checkItemModel.updateOne(
      { _id: id },
      { $set: updateFields },
      { new: true },
    );

    if (result.modifiedCount === 0) {
      throw new HttpException(
        '같은 데이터를 입력하여 업데이트가 이루어지지 않았습니다.',
        HttpStatus.CONFLICT,
      );
    }
    if (result.modifiedCount > 0) return result;

    return null;
  }

  async remove(id: string) {
    const result = await this.checkItemModel.deleteOne({ _id: id });

    if (result.deletedCount > 0) return result;

    return null;
  }
}
