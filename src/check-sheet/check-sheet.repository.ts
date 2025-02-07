import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CheckSheet as SCheckSheet,
  CheckSheetDocument,
  CheckSheet,
  CheckedList,
  // DriversImage,
} from './check-sheet.schema';
import {
  DuplicateDateError,
  ResourceNotFoundError,
} from 'src/helper/ErrorHelper';

export interface CheckSheetRepository {
  createCheckSheet(checkSheetDto: CheckSheet);
  findAll(skip: number, limit: number);
  findOne(id: string);
  update(id: string, checkSheetDto: CheckSheet);
  isCheckSheet(id: string);
  findCheckedLists();
  createCheckedList(checkedListDto: CheckedList);
  findCheckedList(date: string);
  updateCheckedList(_id: string, checkedListDto: CheckedList);
  removeCheckedLists();
  removeCheckedList(_id: string);
  // signature(signatureUrl: string, signatureType: string, name: string);
}

@Injectable()
export class CheckSheetMongoRepository implements CheckSheetRepository {
  constructor(
    @InjectModel(SCheckSheet.name)
    private checkSheetModel: Model<CheckSheetDocument>,
  ) {}

  async findAll(skip: number, limit: number) {
    const checkSheet = (
      await this.checkSheetModel.find().skip(skip).limit(limit)
    ).reverse();

    return checkSheet;
  }

  async countCheckSheet() {
    return await this.checkSheetModel.countDocuments().exec();
  }

  async findOne(id: string) {
    return await this.checkSheetModel.findOne({ _id: id });
  }

  async isCheckSheet(id: string) {
    const checkSheet = await this.checkSheetModel.findOne({
      heavyEquipmentId: id,
    });
    if (checkSheet) return true;
    return false;
  }

  async createCheckSheet(checkSheetDto: CheckSheet) {
    const createCheckSheet = new this.checkSheetModel({ ...checkSheetDto });
    const result = await createCheckSheet.save();
    return result;
  }

  async update(id: string, checkSheetDto: Partial<CheckSheet>) {
    const updateFields: Partial<CheckSheet> = {};
    if (checkSheetDto.checkLists) {
      updateFields['checkLists'] = checkSheetDto.checkLists;
    }
    if (checkSheetDto.imageUrls) {
      updateFields['imageUrls'] = checkSheetDto.imageUrls;
    }

    if (Object.keys(updateFields).length === 0) {
      throw new Error('변경할 데이터가 없습니다.');
    }

    const result = await this.checkSheetModel.updateOne(
      { _id: id },
      { $set: updateFields },
    );

    console.log(updateFields, result);

    if (result.modifiedCount === 0) {
      throw new HttpException(
        '업데이트가 이루어지지 않았습니다.',
        HttpStatus.CONFLICT,
      );
    }

    if (result.modifiedCount > 0) return result;
    return null;
  }

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

  async createCheckedList(checkedListDto: CheckedList) {
    // await this.validateDuplicateDate(checkedListDto);
    // const result = await this.checkSheetModel.findOneAndUpdate(
    //   {},
    //   {
    //     $push: { checkedLists: checkedListDto },
    //     $set: { todayCheckedList: checkedListDto },
    //   },
    //   { upsert: true, new: true, projection: { todayCheckedList: 1 } }, // 없으면 생성(upsert), 새 데이터 반환(new)
    // );
    // if (!result) {
    //   throw new ResourceNotFoundError(
    //     '문서 업데이트 실패: 조건에 맞는 문서를 찾지 못했습니다.',
    //   );
    // }
    // return result?.todayCheckedList;
  }

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

  async updateCheckedList(_id: string, checkedListDto: CheckedList) {
    checkedListDto._id = _id;
    const result = await this.checkSheetModel.findOneAndUpdate(
      { 'checkedLists._id': _id }, // 조건: checkedLists 배열 내 특정 _id
      {
        $set: {
          'checkedLists.$': checkedListDto, // 조건에 맞는 배열 요소를 업데이트
          todayCheckedList: checkedListDto,
        },
      },
      { new: true, projection: { todayCheckedList: 1 } },
    );

    if (!result) {
      throw new ResourceNotFoundError(
        '문서 업데이트 실패: 조건에 맞는 문서를 찾지 못했습니다.',
      );
    }

    // return result.todayCheckedList;
  }

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
