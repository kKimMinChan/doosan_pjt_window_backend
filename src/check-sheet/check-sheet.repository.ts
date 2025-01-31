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

  async getCheckSheet() {
    const checkSheet = await this.checkSheetModel
      .findOne()
      .select('-checkedLists')
      .lean();
    return checkSheet;
  }

  async createCheckSheet(checkSheetDto: CheckSheet) {
    const checkSheet = await this.checkSheetModel.findOne();
    if (checkSheet) {
      checkSheet.checkSheetInfo = checkSheetDto.checkSheetInfo;
      checkSheet.checkLists = checkSheetDto.checkLists;
      checkSheet.imageUrls = checkSheetDto.imageUrls;

      await checkSheet.save();
      return await this.getCheckSheet();
    } else {
      const createCheckSheet = new this.checkSheetModel({ ...checkSheetDto });
      await createCheckSheet.save();
      return await this.getCheckSheet();
    }
  }

  async validateDuplicateDate(createCheckedListDto: CheckedList) {
    const lastCheckedList = await this.checkSheetModel
      .findOne({}, { checkedLists: { $slice: -1 } })
      .lean();

    if (lastCheckedList && lastCheckedList.checkedLists?.length > 0) {
      // 제일 마지막에 있는 리스트가 제일 최신 리스트
      const prevCheckedList = lastCheckedList.checkedLists[0];
      if (prevCheckedList.date === createCheckedListDto.date) {
        throw new DuplicateDateError(
          '날짜가 같은 체크리스트는 생성할 수 없습니다.',
        );
      }
    }
  }

  async createCheckedList(checkedListDto: CheckedList) {
    await this.validateDuplicateDate(checkedListDto);
    const result = await this.checkSheetModel.findOneAndUpdate(
      {},
      {
        $push: { checkedLists: checkedListDto },
        $set: { todayCheckedList: checkedListDto },
      },
      { upsert: true, new: true, projection: { todayCheckedList: 1 } }, // 없으면 생성(upsert), 새 데이터 반환(new)
    );

    if (!result) {
      throw new ResourceNotFoundError(
        '문서 업데이트 실패: 조건에 맞는 문서를 찾지 못했습니다.',
      );
    }

    return result?.todayCheckedList;
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
    return findList.checkedLists[0];
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

    return result.todayCheckedList;
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
