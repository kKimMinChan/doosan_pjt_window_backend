import { Injectable } from '@nestjs/common';
import {
  CheckedSheet,
  CheckedListsDocument,
} from './entities/checked-sheet.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

export class DuplicateDateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateDateError';
  }
}

export class ResourceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResourceNotFoundError';
  }
}

export interface CheckedSheetRepository {
  create(id: string, createCheckedListDto: CheckedSheet);

  // findAll();
  // findOne(date: string);
  // update(_id: string, createCheckedListDto: CheckedList);
  // remove(id: string);
  // removeAll();
}

@Injectable()
export class CheckedSheetMongoRepository implements CheckedSheetRepository {
  constructor(
    @InjectModel(CheckedSheet.name)
    private checkedListsModel: Model<CheckedListsDocument>,
  ) {}

  async create(id: string, createCheckedListDto: CheckedSheet) {
    try {
      // await this.validateDuplicateDate(createCheckedListDto);
      const result = await this.checkedListsModel.updateOne(
        {},
        { $push: { checkedLists: createCheckedListDto } },
        { upsert: true },
      );
      if (!result.acknowledged) {
        throw new Error('날짜가 같은 체크리스트는 생성할 수 없습니다.'); // 데이터베이스 예외
      }
      return createCheckedListDto;
    } catch (error) {
      console.error('Repository Error:', error.message);
      throw error; // 예외를 서비스로 전파
    }
  }

  // async validateDuplicateDate(createCheckedListDto: CheckedList) {
  //   const lastCheckedList = await this.checkedListsModel
  //     .findOne({}, { checkedLists: { $slice: -1 } })
  //     .lean();

  //   if (lastCheckedList && lastCheckedList.checkedLists.length > 0) {
  //     // 제일 마지막에 있는 리스트가 제일 최신 리스트
  //     const prevCheckedList = lastCheckedList.checkedLists[0];
  //     if (prevCheckedList.date === createCheckedListDto.date) {
  //       throw new DuplicateDateError('Duplicate date found');
  //     }
  //   }
  // }

  // async findAll() {
  //   try {
  //     const checkedLists = await this.checkedListsModel.findOne().lean();
  //     if (!checkedLists)
  //       throw new ResourceNotFoundError(
  //         'CheckedLists 데이터가 존재하지 않습니다.',
  //       );
  //     return checkedLists;
  //   } catch (error) {
  //     console.error('Repository Error:', error.message);
  //     throw error;
  //   }
  // }

  // async update(_id: string, checkedListDto: CheckedList) {
  //   const lastCheckedList = await this.checkedListsModel
  //     .findOne({}, { checkedLists: { $slice: -1 } })
  //     .lean();

  //   const result = await this.checkedListsModel.updateOne(
  //     { 'checkedLists._id': _id }, // 조건: checkedLists 배열 내 특정 _id
  //     {
  //       $set: {
  //         'checkedLists.$': checkedListDto, // 조건에 맞는 배열 요소를 업데이트
  //       },
  //     },
  //   );

  //   console.log(result);

  //   if (result.modifiedCount === 0) {
  //     throw new ResourceNotFoundError(
  //       '업데이트할 CheckedLists 데이터가 존재하지 않습니다.',
  //     );
  //   }

  //   // 업데이트된 데이터를 반환하려면 findOne을 다시 호출
  //   return await this.checkedListsModel.findOne(
  //     { 'checkedLists._id': _id },
  //     { 'checkedLists.$': 1 }, // 수정된 배열 요소만 반환
  //   );
  //   // const checkedLists = await this.checkedListsModel.findOne();
  //   // if (checkedLists) {
  //   //   const updatedLists = checkedLists.checkedLists.map((list) => {
  //   //     const findList = list.date === checkedListDto.date;
  //   //     if (findList) {
  //   //       return checkedListDto;
  //   //     }
  //   //     return list;
  //   //   });

  //   //   console.log(updatedLists);

  //   //   checkedLists.checkedLists = updatedLists;

  //   //   return await checkedLists.save();
  //   // } else {
  //   //   throw new ResourceNotFoundError(
  //   //     '업데이트할 CheckedLists 데이터가 존재하지 않습니다.',
  //   //   );
  //   // }
  // }

  // async findOne(date: string) {
  //   const checkedLists = await this.checkedListsModel.findOne();
  //   if (checkedLists) {
  //     const findList = checkedLists.checkedLists.filter(
  //       (list) => list.date === date,
  //     );
  //     if (findList.length > 0) {
  //       return findList;
  //     } else {
  //       throw new ResourceNotFoundError(
  //         '해당 날짜의 CheckedLists 데이터가 존재하지 않습니다.',
  //       );
  //     }
  //   } else {
  //     throw new ResourceNotFoundError(
  //       'CheckedLists 데이터가 존재하지 않습니다.',
  //     );
  //   }
  // }

  // async remove(_id: string) {
  //   const checkedLists = await this.checkedListsModel.findOne();

  //   if (!checkedLists) {
  //     throw new ResourceNotFoundError(
  //       '제거할 CheckedLists 데이터가 존재하지 않습니다.',
  //     );
  //   }

  //   let isRemoved = false;
  //   const updatedLists = checkedLists.checkedLists.filter((list) => {
  //     if (list._id.toString() === _id) {
  //       isRemoved = true;
  //       return false;
  //     }
  //     return true;
  //   });

  //   if (!isRemoved) {
  //     throw new ResourceNotFoundError(
  //       '제거할 CheckedLists 데이터가 존재하지 않습니다.',
  //     );
  //   }

  //   checkedLists.checkedLists = updatedLists;
  //   return await checkedLists.save();
  // }

  // async removeAll() {
  //   const result = await this.checkedListsModel.deleteMany({});
  //   console.log(`${result.deletedCount}개의 문서가 삭제되었습니다.`);
  //   return result;
  // }
}
