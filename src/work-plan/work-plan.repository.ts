import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WorkPlan, WorkPlanDocument } from './entities/work-plan.schema';
import { Model } from 'mongoose';

export interface WorkPlanRepository {
  create(workPlanDto: WorkPlan);
  findOne(id: string);
  findOneLatest(id: string);
  findAll(id, skip: number, limit: number);
  countWorkPlan(id: string);
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
    return workPlan;
  }

  async findOneLatest(id: string) {
    const workPlan = await this.workPlanModel
      .findOne({ equipment: id })
      .sort({ _id: -1 })
      .populate('driverSignatures.driver')
      .exec();
    return workPlan;
  }

  async findOneLatestNotPopulate(id: string) {
    const workPlan = await this.workPlanModel
      .findOne({ equipment: id })
      .sort({ _id: -1 })
      .exec();
    return workPlan;
  }

  async findAll(id: any, skip: number, limit: number) {
    const workPlans = await this.workPlanModel
      .find({ equipment: id })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('driverSignatures.driver');
    return workPlans;
  }
  async countWorkPlan(id: string) {
    return await this.workPlanModel.countDocuments({ equipment: id });
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
