import { BadRequestException, Injectable } from '@nestjs/common';
import { CheckSheet, CheckSheetDocument } from './entities/check-sheet.schema';
import mongoose, { Model, SortOrder } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  CheckItem,
  CheckItemDocument,
} from 'src/check-item/entities/check-item.schema';

export interface CheckSheetRepository {
  create(checkSheetDto: CheckSheet);
  findOne(id: string);
  noPopulateFindOne(id: string);
  findOneLatest(id: string);
  findAll(
    id: string,
    skip: number,
    limit: number,
    order: string,
    todaySkip: boolean,
    inspectionStatus: string,
    startDay: string,
    endDay: string,
  );
  countCheckSheet(
    id: string,
    isToday: boolean,
    inspectionStatus: string,
    startDay: string,
    endDay: string,
  );
  findOneLatestIssue(id: string, isToday: boolean);
  update(id: string, updateDto: Partial<CheckSheet>);
  remove(id: string);
  removeAll();
}

@Injectable()
export class CheckSheetMongoRepository implements CheckSheetRepository {
  constructor(
    @InjectModel(CheckSheet.name)
    private checkSheetModel: Model<CheckSheetDocument>,
    @InjectModel(CheckItem.name)
    private checkItemModel: Model<CheckItemDocument>,
  ) {}

  async create(checkSheetDto: CheckSheet) {
    const newCheckSheet = await new this.checkSheetModel(checkSheetDto).save();
    console.log(newCheckSheet, 'createNewCheckSheet');
    return newCheckSheet;
  }

  async findOne(id: string) {
    const checkSheet = await this.checkSheetModel
      .findOne({ _id: id })
      .populate('items.checkItem');
    return checkSheet;
  }

  async noPopulateFindOne(id: string) {
    const checkSheet = await this.checkSheetModel.findOne({ _id: id });
    return checkSheet;
  }

  async findOneLatest(id: string) {
    const checkSheet = await this.checkSheetModel
      .findOne({
        equipment: new mongoose.Types.ObjectId(id),
      }) // ✅ `ObjectId` 변환 후 비교
      .sort({ _id: -1 })
      .populate('items.checkItem') // ✅ 최신 데이터 우선 정렬
      .exec(); // ✅ `exec()` 호출하여 실행

    return checkSheet;
  }

  async findOneLatestIssue(id: string, isToday: boolean) {
    const filter: any = {
      equipment: new mongoose.Types.ObjectId(id),
      createdAt: { $gte: new Date(Date.now() - 63 * 60 * 60 * 1000) }, // ✅ 최근 63시간 데이터 필터
    };

    // ✅ MongoDB Aggregate 사용하여 최적화
    const pipeline: any = [
      { $match: filter }, // ✅ equipment와 createdAt 필터링
      { $sort: { createdAt: -1 } }, // ✅ 최신 데이터 우선 정렬
      { $skip: isToday ? 1 : 0 }, // ✅ 가장 최신 데이터 1개 제외 (isToday가 true일 경우)
      { $match: { issue: { $ne: null } } }, // ✅ issue가 null이 아닌 데이터 필터링
      { $project: { _id: 0, issue: 1, createdAt: 1 } }, // ✅ issue 필드만 선택
    ];

    const issueList = await this.checkSheetModel.aggregate(pipeline).exec();
    return issueList.length === 0 ? [] : issueList[0];
  }

  async findAll(
    id: string,
    skip: number,
    limit: number,
    order: string,
    todaySkip: boolean,
    inspectionStatus: string,
    startDay: string,
    endDay: string,
  ) {
    const sortOrder: SortOrder = ['asc', 'desc'].includes(order as string)
      ? order === 'asc'
        ? 1
        : -1 // ✅ 문자열을 숫자로 변환
      : -1; // 기본값: 최신순

    const filter: any = {};

    // ✅ 날짜가 있으면 필터 추가
    if (startDay) {
      filter.createdAt = {
        ...filter.createdAt,
        $gte: new Date(new Date(startDay).getTime() - 9 * 60 * 60 * 1000),
      };
    }
    if (endDay) {
      filter.createdAt = {
        ...filter.createdAt,
        $lte: new Date(new Date(endDay).getTime() + 15 * 60 * 60 * 1000),
      };
    }

    if (inspectionStatus === 'checked') {
      filter['issue'] = { $ne: null };
    } else if (inspectionStatus === 'unChecked') {
      filter['issue'] = null;
    }

    // console.log(filter, 'filter', startDay, endDay, '1');

    const pipeline: any[] = [];
    if (todaySkip) {
      pipeline.push(
        { $match: { equipment: new mongoose.Types.ObjectId(id) } },
        { $sort: { createdAt: -1 } },
        { $skip: 1 },
      );
    } else {
      pipeline.push({
        $match: { equipment: new mongoose.Types.ObjectId(id) },
      });
    }
    pipeline.push({ $match: filter });
    pipeline.push(
      { $sort: { createdAt: sortOrder } },
      { $skip: skip },
      { $limit: limit },
    );
    pipeline.push({
      $lookup: {
        from: 'checkitems',
        localField: 'items.checkItem',
        foreignField: '_id',
        as: 'populatedCheckItems',
      },
    });

    pipeline.push({ $unwind: '$items' });

    pipeline.push({
      $addFields: {
        'items.checkItem': {
          $arrayElemAt: [
            {
              $filter: {
                input: '$populatedCheckItems',
                as: 'ci',
                cond: { $eq: ['$$ci._id', '$items.checkItem'] }, // ✅ items.checkItem과 매칭되는 checkItem 찾기
              },
            },
            0,
          ],
        },
      },
    });
    pipeline.push({
      $addFields: {
        'items.checkItem.id': '$items.checkItem._id',
        'items.id': '$items._id',
      },
    });

    pipeline.push({
      $project: {
        populatedCheckItems: 0, // ✅ 임시 필드 제거
        'items.checkItem._id': 0, // ✅ checkItem 내부의 `_id` 필드 제거
        'items.checkItem.__v': 0,
        'items._id': 0,
        __v: 0, // ✅ Mongoose 버전 필드 제거
      },
    });

    pipeline.push({
      $group: {
        _id: '$_id',
        items: { $push: '$items' }, // ✅ `items` 배열로 복구
        images: { $first: '$images' },
        issue: { $first: '$issue' },
        inspector: { $first: '$inspector' },
        reviewer: { $first: '$reviewer' },
        equipment: { $first: '$equipment' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
      },
    });

    // ✅ equipment, reviewer, inspector 컬렉션에서 정보 가져오기
    pipeline.push({
      $lookup: {
        from: 'heavyequipments', // ✅ equipment 정보를 가져오기 위한 조인
        localField: 'equipment',
        foreignField: '_id',
        as: 'equipmentData',
      },
    });
    pipeline.push({
      $lookup: {
        from: 'userinfos', // ✅ inspector 정보를 가져오기 위한 조인
        localField: 'inspector',
        foreignField: '_id',
        as: 'inspectorData',
      },
    });
    pipeline.push({
      $lookup: {
        from: 'userinfos', // ✅ reviewer 정보를 가져오기 위한 조인
        localField: 'reviewer',
        foreignField: '_id',
        as: 'reviewerData',
      },
    });

    // ✅ 불필요한 배열 제거 (각 참조 데이터는 하나의 객체만 가져오도록)
    pipeline.push({
      $addFields: {
        equipment: {
          $mergeObjects: [
            { id: '$_id' },
            { $arrayElemAt: ['$equipmentData', 0] },
          ],
        },
        inspector: {
          $mergeObjects: [
            { id: '$_id' },
            { $arrayElemAt: ['$inspectorData', 0] },
          ],
        },
        reviewer: {
          $mergeObjects: [
            { id: '$_id' },
            { $arrayElemAt: ['$reviewerData', 0] },
          ],
        },
      },
    });

    // ✅ 필요 없는 필드 제거
    pipeline.push({
      $project: {
        equipmentData: 0,
        inspectorData: 0,
        reviewerData: 0,
        'equipment.__v': 0,
        'inspector.__v': 0,
        'reviewer.__v': 0,
        'equipment._id': 0,
        'inspector._id': 0,
        'reviewer._id': 0,
      },
    });

    pipeline.push({ $sort: { createdAt: sortOrder } });

    pipeline.push({
      $addFields: {
        id: '$_id',
      },
    });
    pipeline.push({
      $project: {
        _id: 0,
      },
    });

    const checkSheets = await this.checkSheetModel.aggregate(pipeline);
    return checkSheets;

    // const checkSheets = await this.checkSheetModel
    //   .find(filter)
    //   .sort({ _id: sortOrder })
    //   .skip(skip)
    //   .limit(limit)
    //   .populate('items.checkItem');
    // return checkSheets;
  }

  async countCheckSheet(
    id: string,
    isToday: boolean,
    inspectionStatus: string,
    startDay: string,
    endDay: string,
  ) {
    const filter: any = { equipment: new mongoose.Types.ObjectId(id) };

    // ✅ 날짜 필터 적용 (KST 기준 → UTC 변환)
    if (startDay) {
      filter.createdAt = {
        ...filter.createdAt,
        $gte: new Date(new Date(startDay).getTime() + 9 * 60 * 60 * 1000), // KST → UTC 변환
      };
    }
    if (endDay) {
      filter.createdAt = {
        ...filter.createdAt,
        $lte: new Date(new Date(endDay).getTime() + 9 * 60 * 60 * 1000), // KST → UTC 변환 //
      };
    }

    // ✅ 점검 상태 필터 적용
    if (inspectionStatus === 'CHECKED') {
      filter.issue = { $ne: null };
    } else if (inspectionStatus === 'UNCHECKED') {
      filter.issue = null;
    }

    // ✅ 필터 적용하여 개수 계산
    const totalCount = await this.checkSheetModel.countDocuments(filter).exec();

    return isToday ? totalCount - 1 : totalCount;
  }

  async update(id: string, updateDto: Partial<CheckSheet>) {
    const checkSheet = await this.checkSheetModel.findById(id).exec();

    // ✅ 업데이트할 필드만 동적으로 선택
    const updateFields: Partial<CheckSheet> = {};

    if (updateDto.items.length > 0) {
      updateFields.items = updateDto.items;
    }
    // ✅ `images` 업데이트 로직
    if (updateDto.images?.length > 0) {
      // 기존 `checkSheet.images`를 `index` 기반으로 빠르게 검색 가능하도록 변환
      const imageMap = new Map(
        checkSheet.images.map((image) => [image.index, image]),
      );

      // 업데이트할 images 순회
      updateDto.images.forEach((newImage) => {
        if (imageMap.has(newImage.index)) {
          // ✅ 기존 index가 존재하는 경우 업데이트
          imageMap.set(newImage.index, newImage);
        } else {
          // ✅ 새로운 index가 추가된 경우 유지
          imageMap.set(newImage.index, newImage);
        }
      });

      // ✅ 변경된 images 배열 업데이트
      updateFields.images = Array.from(imageMap.values());
    }
    if (updateDto.issue !== undefined) {
      updateFields.issue = updateDto.issue;
    }
    if (updateDto.inspector !== undefined) {
      updateFields.inspector = updateDto.inspector;
    }
    if (updateDto.reviewer !== undefined) {
      updateFields.reviewer = updateDto.reviewer;
    }
    if (updateDto.equipment !== undefined) {
      updateFields.equipment = updateDto.equipment;
    }

    console.log(updateFields, 'updateFields');

    // ✅ 해당 `checkSheet` 찾고 업데이트
    const updatedCheckSheet = await this.checkSheetModel
      .findByIdAndUpdate(
        id,
        { $set: updateFields }, // ✅ 필드가 존재하는 경우만 업데이트
        { new: true, omitUndefined: true }, // ✅ 업데이트된 문서 반환 & undefined 필드 무시
      )
      .exec();

    return updatedCheckSheet;
  }

  async remove(id: string) {
    const result = await this.checkSheetModel.deleteOne({ _id: id });
    if (result.deletedCount > 0) return result;

    return null;
  }

  async removeAll() {
    const result = await this.checkSheetModel.deleteMany();
    return result;
  }
}
