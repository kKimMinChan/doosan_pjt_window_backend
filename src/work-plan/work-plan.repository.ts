import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WorkPlan, WorkPlanDocument } from './entities/work-plan.schema';
import { Model } from 'mongoose';

export interface WorkPlanRepository {
  create(workPlanDto: WorkPlan);
  findOne(id: string);
  findAll(id, skip: number, limit: number);
  update(id: string, workPlanDto: Partial<WorkPlan>);
  remove(id: string);
}

@Injectable()
export class WorkPlanMongoRepository implements WorkPlanRepository {
  constructor(
    @InjectModel(WorkPlan.name) private workPlanModel: Model<WorkPlanDocument>,
  ) {}
  async create(workPlanDto: WorkPlan) {}
  async findOne(id: string) {}
  async findAll(id: any, skip: number, limit: number) {}

  async update(id: string, workPlanDto: Partial<WorkPlan>) {}

  async remove(id: string) {}
}
