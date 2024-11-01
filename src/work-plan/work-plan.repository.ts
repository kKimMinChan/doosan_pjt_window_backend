import { Injectable } from '@nestjs/common';
import { WorkPlan, WorkPlanDocument, WorkPlanItem } from './work-plan.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface WorkPlanRepository {
  createWorkPlan(workPlanItem: WorkPlanItem);
  getWorkPlan();
  signature(signatureUrl: string, signatureType: string, name: string);
  updatedDriver(workPlanItem: WorkPlanItem);
}

@Injectable()
export class WorkPlanMongoRepository implements WorkPlanRepository {
  constructor(
    @InjectModel(WorkPlan.name)
    private workPlanModel: Model<WorkPlanDocument>,
  ) {}

  async getWorkPlan() {
    const workPlan = await this.workPlanModel.findOne();
    if (workPlan) {
      return workPlan;
    }
    return null;
  }

  async updatedDriver(workPlanItem: WorkPlanItem) {
    const workPlanDocument = await this.workPlanModel.findOne();
    const workPlanList = workPlanDocument.workPlanList;
    workPlanList.pop();
    workPlanDocument.workPlanList.push(workPlanItem);
    await workPlanDocument.save();
  }

  async createWorkPlan(workPlanItem: WorkPlanItem) {
    const workPlanDocument = await this.workPlanModel.findOne();
    const workPlanItemCopy = JSON.parse(JSON.stringify(workPlanItem));
    if (workPlanDocument) {
      const workPlanList = workPlanDocument?.workPlanList;
      const workPlan = workPlanList[workPlanDocument.workPlanList.length - 1];
      console.log(workPlan, workPlanItem, '이미지 변경');
      workPlanDocument.workPlanList.push(workPlanItem);
      await workPlanDocument.save();
      return workPlanDocument.workPlanList[
        workPlanDocument.workPlanList.length - 1
      ];
    } else {
      const createWorkPlan = new this.workPlanModel({
        workPlanList: [workPlanItemCopy],
      });
      return await createWorkPlan.save();
    }
  }

  async signature(signatureUrl: string, signatureType: string, name: string) {
    try {
      const workPlanDocument = await this.workPlanModel.findOne();
      const workPlanList = workPlanDocument.workPlanList;
      const workPlan = workPlanList.pop();
      if (!workPlan) {
        console.log('workPlan not found');
        return null;
      }

      if (name) {
        const driverIdx = workPlan.signature.driver.findIndex(
          (driver) => driver.name === name,
        );

        if (driverIdx !== -1) {
          workPlan.signature.driver[driverIdx].signatureImage = {
            ...workPlan.signature.driver[driverIdx].signatureImage,
            image_url: signatureUrl,
          };
        }
      } else {
        if (signatureType) {
          workPlan.signature[signatureType] = {
            image_url: signatureUrl,
          };
        }
      }

      workPlanList.push(workPlan);

      // 전체 workPlanDocument를 저장합니다.
      workPlanDocument.workPlanList = workPlanList;
      await workPlanDocument.save();
      return workPlanList;
    } catch (error) {
      console.error('Error fetching checkItem: ', error);
      throw error;
    }
  }
}
