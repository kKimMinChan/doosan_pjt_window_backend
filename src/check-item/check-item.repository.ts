import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CheckItem, CheckItemDocument } from './entities/check-item.schema';

export interface CheckItemRepository {
  create(checkItemDto: CheckItem[]): Promise<{ id: string }[]>;
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

  async create(checkItemDto: CheckItem[]): Promise<{ id: string }[]> {
    if (checkItemDto?.length === 0) {
      return [];
    }
    // ✅ 1. 모든 요청 데이터에 대한 `type`, `method`, `content` 조합을 생성
    console.log(checkItemDto);
    const uniqueKeys = checkItemDto.map((item) => ({
      type: item.type,
      method: item.method,
      content: item.content,
    }));
    // ✅ 2. 기존 데이터 조회 (한 번의 요청으로 모든 항목 조회)
    const existingItems = await this.checkItemModel
      .find({
        $or: uniqueKeys, // 여러 개의 조건을 한 번에 조회
      })
      .lean();
    // ✅ 3. 기존 항목의 `_id`를 매핑 (Map 사용)
    const existingItemsMap = new Map(
      existingItems.map((item) => [
        `${item.type}-${item.method}-${item.content}`,
        item._id.toString(),
      ]),
    );

    // ✅ 4. 새로 추가해야 하는 항목 필터링
    const newItems = checkItemDto.filter(
      (item) =>
        !existingItemsMap.has(`${item.type}-${item.method}-${item.content}`),
    );
    let insertedItems = [];
    if (newItems.length > 0) {
      // ✅ 5. 새 항목 `bulkWrite`로 한 번에 삽입
      const insertResult = await this.checkItemModel.insertMany(newItems);
      insertedItems = insertResult.map((item) => ({
        key: `${item.type}-${item.method}-${item.content}`,
        id: item._id.toString(),
      }));
    }
    // ✅ 6. 기존 항목과 새로 삽입한 항목을 합쳐서 `_id` 리스트 반환
    const allItems = [
      ...existingItemsMap.entries(),
      ...insertedItems.map((item) => [item.key, item.id]),
    ];
    return allItems.map(([_, id]) => id);
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
