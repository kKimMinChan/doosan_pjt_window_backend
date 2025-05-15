import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WorkPlan, WorkPlanDocument } from './entities/work-plan.schema';
import mongoose, { Model, SortOrder } from 'mongoose';
import { ResourceNotFoundError } from 'src/helper/ErrorHelper';
import { stringify } from 'querystring';

export interface WorkPlanRepository {
  create(workPlanDto: WorkPlan);
  findOne(id: string);
  findOneNotPopulate(id: string);
  findTodayEntry(id: string);
  findAll(
    id: string,
    skip: number,
    limit: number,
    order: string,
    todayId: string,
    inspectionStatus: string,
    startDay: string,
    endDay: string,
  );
  countWorkPlan(
    id: string,
    todayId: string,
    inspectionStatus: string,
    startDay: string,
    endDay: string,
  );
  updateSignature(
    id: string,
    matchValue: string,
    urlMode: {
      dark: string;
      white: string;
    },
  );
  updateAdminSignature(
    id: string,
    type: 'create' | 'finish',
    urlMode: { dark: string; white: string },
  );
  updateDetails(id: string, workPlanDto: WorkPlan);
  remove(id: string);
}

@Injectable()
export class WorkPlanMongoRepository implements WorkPlanRepository {
  constructor(
    @InjectModel(WorkPlan.name) private workPlanModel: Model<WorkPlanDocument>,
  ) {}
  async create(workPlanDto: Partial<WorkPlan>) {
    const workPlan = new this.workPlanModel(workPlanDto);
    return await workPlan.save();
  }
  async findOne(id: string) {
    const workPlan = await this.workPlanModel
      .findById(id)
      .populate('driverSignatures.driver');

    if (!workPlan)
      throw new ResourceNotFoundError(
        '해당 id의 작업 계획서가 존재하지 않습니다.',
      );
    return workPlan;
  }

  async findOneNotPopulate(id: string) {
    const workPlan = await this.workPlanModel.findById(id);

    if (!workPlan)
      throw new ResourceNotFoundError(
        '해당 id의 작업 계획서가 존재하지 않습니다.',
      );
    return workPlan;
  }

  async findTodayEntry(id: string) {
    const today = new Date().toISOString().split('T')[0]; // 오늘 날짜 (YYYY-MM-DD)

    const includingTodayData = await this.workPlanModel
      .findOne({
        equipment: id,
        'mutableData.startDay': { $lte: today }, // 시작일이 오늘 이전 또는 동일
        'mutableData.endDay': { $gte: today }, // 종료일이 오늘 이후 또는 동일
      })
      .populate('driverSignatures.driver')
      .exec();

    return includingTodayData;
  }

  async findAllTodayEntry(ids: string[]) {
    const today = new Date().toISOString().split('T')[0]; // 오늘 날짜 (YYYY-MM-DD)

    const includingTodayData = await Promise.all(
      ids.map((id) =>
        this.workPlanModel
          .findOne({
            equipment: id,
            'mutableData.startDay': { $lte: today }, // 시작일이 오늘 이전 또는 동일
            'mutableData.endDay': { $gte: today }, // 종료일이 오늘 이후 또는 동일
          })
          .setOptions({ autopopulate: false })
          .exec(),
      ),
    );

    return includingTodayData;
  }

  async findOneLatestNotPopulate(id: string) {
    const workPlan = await this.workPlanModel
      .findOne({ equipment: id })
      .sort({ _id: -1 })
      .exec();
    return workPlan;
  }

  async findAll(
    id: string,
    skip: number,
    limit: number,
    todayId: string,
    order: string,
    inspectionStatus: string,
    startDay: string,
    endDay: string,
  ) {
    console.log(inspectionStatus, startDay, endDay, new Date());
    const sortOrder: SortOrder = order === 'asc' ? 1 : -1;

    const filter: any = {
      equipment: new mongoose.Types.ObjectId(id),
      _id: { $ne: new mongoose.Types.ObjectId(todayId) }, // ✅ 특정 문서 제외
    };

    // ✅ 날짜 필터 추가
    if (startDay && endDay) {
      filter.$or = [
        { 'mutableData.startDay': { $gte: startDay, $lte: endDay } }, // 시작일이 기준 범위 내
        { 'mutableData.endDay': { $gte: startDay, $lte: endDay } }, // 종료일이 기준 범위 내
        {
          'mutableData.startDay': { $lte: startDay },
          'mutableData.endDay': { $gte: endDay },
        }, // 전체 포함
      ];
    }

    if (startDay || endDay) {
      filter.$or = [];

      if (startDay && !endDay) {
        filter.$or.push({
          'mutableData.startDay': { $gte: startDay },
          // 'mutableData.endDay': { $exists: false },
        });
      }

      if (!startDay && endDay) {
        filter.$or.push({
          'mutableData.endDay': { $lte: endDay },
          // 'mutableData.startDay': { $exists: false },
        });
      }
    }

    // ✅ 점검 상태 필터 추가
    if (inspectionStatus === 'checked') {
      filter['adminSignatures.finish'] = { $ne: null };
    } else if (inspectionStatus === 'unChecked') {
      filter['adminSignatures.finish'] = null;
    }

    console.log(JSON.stringify(filter, null, 2), 'findAll filter');

    const pipeline: any[] = [];
    pipeline.push({ $match: filter });
    pipeline.push(
      { $sort: { 'mutableData.startDay': sortOrder } },
      { $skip: skip },
      { $limit: limit },
    );

    pipeline.push(
      {
        $lookup: {
          from: 'userinfos', // 💡 컬렉션 이름 정확하게!
          localField: 'mutableData.writer',
          foreignField: '_id',
          as: 'mutableData.writer',
        },
      },
      {
        $unwind: {
          path: '$mutableData.writer',
          preserveNullAndEmptyArrays: true, // ⛔ null 방지
        },
      },
    );

    pipeline.push({
      $lookup: {
        from: 'heavyequipments', // 💡 컬렉션 이름 정확하게!
        localField: 'equipment',
        foreignField: '_id',
        as: 'equipment',
      },
    });

    pipeline.push(
      {
        $unwind: {
          path: '$driverSignatures',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'userinfos',
          localField: 'driverSignatures.driver',
          foreignField: '_id',
          as: 'matchedDriver',
        },
      },
      {
        $unwind: {
          path: '$matchedDriver',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          'driverSignatures.driver': {
            $mergeObjects: [
              '$matchedDriver',
              {
                id: '$matchedDriver._id',
              },
            ],
          },
        },
      },
      {
        $unset: ['matchedDriver._id'],
      },
      {
        $project: {
          matchedDriver: 0,
        },
      },
      {
        $group: {
          _id: '$_id',
          driverSignatures: { $push: '$driverSignatures' },
          // 👇 아래는 필요한 다른 필드 다 복원해줘야 함!
          mutableData: { $first: '$mutableData' },
          fixedData: { $first: '$fixedData' },
          adminSignatures: { $first: '$adminSignatures' },
          equipment: { $first: '$equipment' },
          createdAt: { $first: '$createdAt' },
          updatedAt: { $first: '$updatedAt' },
          __v: { $first: '$__v' },
        },
      },
    );

    pipeline.push(
      // ✅ mutableData.writer._id → mutableData.writer.id
      {
        $addFields: {
          'mutableData.writer.id': '$mutableData.writer._id',
        },
      },
      {
        $unset: ['mutableData.writer._id'], // ⚠️ 필요하면 _id 삭제
      },

      // ✅ equipment._id → equipment.id (equipment가 배열일 수도 있음!)
      {
        $addFields: {
          equipment: {
            $map: {
              input: '$equipment',
              as: 'eq',
              in: {
                $mergeObjects: ['$$eq', { id: '$$eq._id' }],
              },
            },
          },
        },
      },
      {
        $unset: ['equipment._id'],
      },
    );

    pipeline.push(
      {
        $addFields: {
          id: '$_id',
        },
      },
      {
        $unset: ['_id'], // ⚠️ 필요하면 _id 삭제
      },
    );

    pipeline.push({ $sort: { 'mutableData.startDay': sortOrder } });

    // // ✅ find()로 쿼리 실행
    // const workPlans = await this.workPlanModel
    //   .find(filter)
    //   .sort({ 'mutableData.startDay': sortOrder }) // ✅ 시작일 기준 오름차순 정렬
    //   .skip(skip)
    //   .limit(limit)
    //   .exec();

    const workPlans = await this.workPlanModel.aggregate(pipeline);

    console.log(workPlans.length, 'workPlans--------');

    return workPlans;
  }
  async countWorkPlan(
    id: string,
    todayId: string,
    inspectionStatus: string,
    startDay: string,
    endDay: string,
  ) {
    console.log(inspectionStatus, startDay, endDay, 'count');
    const filter: any = {
      equipment: new mongoose.Types.ObjectId(id),
      _id: { $ne: new mongoose.Types.ObjectId(todayId) }, // ✅ 특정 문서 제외
    };

    // ✅ 날짜 필터 추가
    if (startDay && endDay) {
      filter.$or = [
        { 'mutableData.startDay': { $gte: startDay, $lte: endDay } }, // 시작일이 기준 범위 내
        { 'mutableData.endDay': { $gte: startDay, $lte: endDay } }, // 종료일이 기준 범위 내
        {
          'mutableData.startDay': { $lte: startDay },
          'mutableData.endDay': { $gte: endDay },
        }, // 전체 포함
      ];
    }

    if (startDay || endDay) {
      filter.$or = [];

      if (startDay && !endDay) {
        filter.$or.push({
          'mutableData.startDay': { $gte: startDay },
          // 'mutableData.endDay': { $exists: false },
        });
      }

      if (!startDay && endDay) {
        filter.$or.push({
          'mutableData.endDay': { $lte: endDay },
          // 'mutableData.startDay': { $exists: false },
        });
      }
    }

    // ✅ 점검 상태 필터 추가
    if (inspectionStatus === 'checked') {
      filter['adminSignatures.finish'] = { $ne: null };
    } else if (inspectionStatus === 'unChecked') {
      filter['adminSignatures.finish'] = null;
    }

    console.log(JSON.stringify(filter, null, 2), 'count filter');

    const count = await this.workPlanModel.countDocuments(filter).exec();

    console.log(count, 'count');

    return count;
  }

  async updateDetails(id: string, workPlanDto: Partial<WorkPlan>) {
    const result = await this.workPlanModel.updateOne(
      { _id: id },
      { $set: workPlanDto },
    );

    return result;
  }

  async updateSignature(
    id: string,
    matchValue: string,
    urlMode: {
      dark: string;
      white: string;
    },
  ) {
    console.log(id, matchValue, urlMode);
    const updateSignature = await this.workPlanModel.updateOne(
      {
        _id: id,
        ['driverSignatures']: { $elemMatch: { ['driver']: matchValue } },
      },
      {
        $set: { [`${'driverSignatures'}.$.urlMode`]: urlMode },
      },
    );
    if (updateSignature.matchedCount === 0) {
      const addSignature = await this.workPlanModel.updateOne(
        {
          _id: id,
        },
        {
          $push: {
            ['driverSignatures']: {
              ['driver']: matchValue,
              urlMode,
            },
          },
        },
      );
      return addSignature;
    }
    // const updateSignature = await this.workPlanModel.updateOne(
    //   {
    //     _id: id,
    //     [key]: { $elemMatch: { [matchField]: matchValue } },
    //   },
    //   {
    //     $set: { [`${key}.$.urlMode`]: urlMode },
    //   },
    // );
    // if (updateSignature.matchedCount === 0) {
    //   const addSignature = await this.workPlanModel.updateOne(
    //     {
    //       _id: id,
    //     },
    //     {
    //       $push: {
    //         [key]: {
    //           [matchField]: matchValue,
    //           urlMode,
    //         },
    //       },
    //     },
    //   );
    //   return addSignature;
    // }
    return updateSignature;
  }

  async updateAdminSignature(
    id: string,
    type: 'create' | 'finish',
    urlMode: { dark: string; white: string },
  ) {
    const updateResult = await this.workPlanModel.updateOne(
      { _id: id },
      { $set: { [`adminSignatures.${type}`]: urlMode } }, // ✅ Map 키 값을 동적으로 업데이트
    );

    return updateResult;
  }

  async remove(id: string) {
    return await this.workPlanModel.deleteOne({ _id: id });
  }
}
