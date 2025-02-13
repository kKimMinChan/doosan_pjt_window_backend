import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  DuplicateDateError,
  ResourceNotFoundError,
} from 'src/helper/ErrorHelper';
import {
  CheckItem,
  CheckSheetInfo,
  CheckSheetInfoDocument,
} from './check-sheet.schema';

export interface CheckSheetRepository {
  createCheckSheet(checkSheetDto: CheckSheetInfo);
  createCheckItem(type: '지게차' | '대차' | '크레인', checkItemDto: CheckItem);
  isExistType(type);
  findAll(skip: number, limit: number);
  findAllCheckItems(type: '지게차' | '대차' | '크레인');
  findOne(type: '지게차' | '대차' | '크레인');
  findOneCheckItem(id: string);
  updateOneCheckItem(id: string, checkItemDto: CheckItem);
  updateCheckItems(type: '지게차' | '대차' | '크레인', newItems: CheckItem[]);
  removeCheckItem(id: string);
  // update(id: string, checkSheetDto: CheckSheet);
  // isCheckSheet(id: string);
  // findCheckedLists();
  // createCheckedList(checkedListDto: CheckedList);
  // findCheckedList(date: string);
  // updateCheckedList(_id: string, checkedListDto: CheckedList);
  // removeCheckedLists();
  // removeCheckedList(_id: string);
  // signature(signatureUrl: string, signatureType: string, name: string);
}

@Injectable()
export class CheckSheetMongoRepository implements CheckSheetRepository {
  constructor(
    @InjectModel(CheckSheetInfo.name)
    private checkSheetModel: Model<CheckSheetInfoDocument>,
  ) {}

  async findAllCheckItems(type: '지게차' | '대차' | '크레인') {
    const checkItems = await this.checkSheetModel.findOne(
      { type },
      { checkItems: 1 },
    );

    return checkItems.checkItems;
  }

  async findAll(skip: number, limit: number) {
    const checkSheet = (
      await this.checkSheetModel.find().skip(skip).limit(limit)
    ).reverse();

    return checkSheet;
  }

  async countCheckSheet() {
    return await this.checkSheetModel.countDocuments().exec();
  }

  async findOneCheckItem(id: string) {
    const checkItem = await this.checkSheetModel.findOne(
      { 'checkItems._id': id },
      { 'checkItems.$': 1 },
    );

    return checkItem.checkItems[0];
  }

  async findOne(type: string) {
    return await this.checkSheetModel.findOne({ type });
  }

  async isCheckSheet(id: string) {
    const checkSheet = await this.checkSheetModel.findOne({
      heavyEquipmentId: id,
    });
    if (checkSheet) return true;
    return false;
  }

  async createCheckSheet(checkSheetInfoDto: CheckSheetInfo) {
    console.log(checkSheetInfoDto, 'dto');
    const createCheckSheet = new this.checkSheetModel({ ...checkSheetInfoDto });
    const result = await createCheckSheet.save();
    console.log(result);
    return result;
  }

  async isExistType(type: '지게차' | '대차' | '크레인') {
    const exist = await this.checkSheetModel.exists({ type });

    return exist;
  }

  async createCheckItem(
    type: '지게차' | '대차' | '크레인',
    checkItemDto: CheckItem,
  ) {
    const result = await this.checkSheetModel.updateOne(
      { type },
      { $push: { checkItems: checkItemDto } },
    );
    return result;
  }

  async updateOneCheckItem(id: string, checkItemDto: Partial<CheckItem>) {
    const updateFields: Partial<CheckItem> = {};

    if (checkItemDto.content) {
      updateFields['checkItems.$[elem].content'] = checkItemDto.content;
    }
    if (checkItemDto.type) {
      updateFields['checkItems.$[elem].type'] = checkItemDto.type;
    }
    if (checkItemDto.method) {
      updateFields['checkItems.$[elem].method'] = checkItemDto.method;
    }
    if (checkItemDto.isOk !== undefined) {
      updateFields['checkItems.$[elem].isOk'] = checkItemDto.isOk;
    }

    console.log(updateFields);

    const result = await this.checkSheetModel.updateOne(
      { 'checkItems._id': id }, // ✅ 배열 내부 특정 `_id` 값을 가진 요소 찾기
      { $set: updateFields }, // ✅ 업데이트할 필드 적용
      { arrayFilters: [{ 'elem._id': id }] }, // ✅ 배열 내 특정 요소만 업데이트
    );

    console.log(result, 'result');

    return result;
  }

  async removeCheckItem(id: string) {
    const result = await this.checkSheetModel.updateOne(
      { 'checkItems._id': id }, // ✅ `checkItems` 내부에서 해당 `_id`를 가진 문서 찾기
      { $pull: { checkItems: { _id: id } } }, // ✅ 해당 `_id`를 가진 항목을 `checkItems` 배열에서 제거
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundException(
        `해당 ID(${id})의 점검 항목을 찾을 수 없습니다.`,
      );
    }

    return result;
  }

  async updateCheckItems(
    type: '지게차' | '대차' | '크레인',
    newItems: CheckItem[],
  ) {
    const existingItems = await this.findAllCheckItems(type);
    if (!existingItems) {
      throw new NotFoundException(
        `데이터가 존재하지 않습니다. 요청한 유형: ${type}`,
      );
    }

    if (existingItems.length !== newItems.length) {
      throw new BadRequestException(
        `기존 데이터 개수(${existingItems.length})와 전송된 데이터 개수(${newItems.length})가 다릅니다.`,
      );
    }

    const updates = [];
    const existingItemsMap = new Map(
      existingItems.map((item: any) => [
        `${item.type}-${item.method}-${item.content}`,
        item,
      ]),
    );

    for (const newItem of newItems) {
      const key = `${newItem.type}-${newItem.method}-${newItem.content}`;
      const existingItem = existingItemsMap.get(key);
      console.log(key, existingItem);
      if (!existingItem) {
        updates.push({
          updateOne: {
            filter: { 'checkItems._id': existingItem?.id },
            update: {
              $set: {
                'checkItems.$.type': newItem.type,
                'checkItems.$.method': newItem.method,
                'checkItems.$.content': newItem.content,
                updatedAt: new Date(),
              },
            },
          },
        });
      }
    }

    console.log(updates);

    if (updates.length > 0) {
      await this.checkSheetModel.bulkWrite(updates);
    }

    return updates.length;
  }

  // async update(id: string, checkSheetDto: Partial<CheckSheet>) {
  //   const updateFields: Partial<CheckSheet> = {};
  //   if (checkSheetDto.checkLists) {
  //     updateFields['checkLists'] = checkSheetDto.checkLists;
  //   }
  //   if (checkSheetDto.imageUrls) {
  //     updateFields['imageUrls'] = checkSheetDto.imageUrls;
  //   }

  //   if (Object.keys(updateFields).length === 0) {
  //     throw new Error('변경할 데이터가 없습니다.');
  //   }

  //   const result = await this.checkSheetModel.updateOne(
  //     { _id: id },
  //     { $set: updateFields },
  //   );

  //   console.log(updateFields, result);

  //   if (result.modifiedCount === 0) {
  //     throw new HttpException(
  //       '업데이트가 이루어지지 않았습니다.',
  //       HttpStatus.CONFLICT,
  //     );
  //   }

  //   if (result.modifiedCount > 0) return result;
  //   return null;
  // }

  // async validateDuplicateDate(createCheckedListDto: CheckedList) {
  //   const lastCheckedList = await this.checkSheetModel
  //     .findOne({}, { checkedLists: { $slice: -1 } })
  //     .lean();

  //   if (lastCheckedList && lastCheckedList.checkedLists?.length > 0) {
  //     // 제일 마지막에 있는 리스트가 제일 최신 리스트
  //     const prevCheckedList = lastCheckedList.checkedLists[0];
  //     if (prevCheckedList.date === createCheckedListDto.date) {
  //       throw new DuplicateDateError(
  //         '날짜가 같은 체크리스트는 생성할 수 없습니다.',
  //       );
  //     }
  //   }
  // }

  // async createCheckedList(checkedListDto: CheckedList) {
  //   // await this.validateDuplicateDate(checkedListDto);
  //   // const result = await this.checkSheetModel.findOneAndUpdate(
  //   //   {},
  //   //   {
  //   //     $push: { checkedLists: checkedListDto },
  //   //     $set: { todayCheckedList: checkedListDto },
  //   //   },
  //   //   { upsert: true, new: true, projection: { todayCheckedList: 1 } }, // 없으면 생성(upsert), 새 데이터 반환(new)
  //   // );
  //   // if (!result) {
  //   //   throw new ResourceNotFoundError(
  //   //     '문서 업데이트 실패: 조건에 맞는 문서를 찾지 못했습니다.',
  //   //   );
  //   // }
  //   // return result?.todayCheckedList;
  // }

  async findCheckedLists() {
    const checkedLists = await this.checkSheetModel
      .findOne({}, 'checkedLists') //조건 없이 첫 번째 문서에서 checkedLists 필드만 선택
      .lean();

    return checkedLists;
  }

  async findCheckedList(date: string) {
    const findList = await this.checkSheetModel.findOne(
      {
        'checkedLists.date': date,
      },
      { checkedLists: { $elemMatch: { date } } }, //배열에서 조건에 맞는 첫 번째 요소를 반환
    );
    // return findList.checkedLists[0];
  }

  // async updateCheckedList(_id: string, checkedListDto: CheckedList) {
  //   checkedListDto._id = _id;
  //   const result = await this.checkSheetModel.findOneAndUpdate(
  //     { 'checkedLists._id': _id }, // 조건: checkedLists 배열 내 특정 _id
  //     {
  //       $set: {
  //         'checkedLists.$': checkedListDto, // 조건에 맞는 배열 요소를 업데이트
  //         todayCheckedList: checkedListDto,
  //       },
  //     },
  //     { new: true, projection: { todayCheckedList: 1 } },
  //   );

  //   if (!result) {
  //     throw new ResourceNotFoundError(
  //       '문서 업데이트 실패: 조건에 맞는 문서를 찾지 못했습니다.',
  //     );
  //   }

  //   // return result.todayCheckedList;
  // }

  async removeCheckedLists() {
    const result = await this.checkSheetModel.updateMany(
      {}, // 조건: 모든 문서
      { $unset: { checkedLists: '' } }, // `checkedLists` 필드를 제거
    );
    if (!result.acknowledged) {
      throw new Error(
        'repository Error:  checkedLists 전체 삭제 과정에서 에러 발생',
      );
    }
    return 'checkedLists 필드가 삭제되었습니다.';
  }

  async removeCheckedList(_id: string) {
    const result = await this.checkSheetModel.updateMany(
      {},
      { $pull: { checkedLists: { _id: _id } } },
    );
    if (!result.modifiedCount) {
      throw new ResourceNotFoundError(
        '제거할 CheckedLists 데이터가 존재하지 않습니다.',
      );
    }
    return '해당 항목이 삭제되었습니다.';
  }
}
