import { Injectable } from '@nestjs/common';
import { WorkPlanRequest } from './dto/work-plan.request';
import { UpdateWorkPlanDto } from './dto/work-plan.response';
import { ErrorHelper } from 'src/helper/ErrorHelper';

@Injectable()
export class WorkPlanService {
  create(workPlanDto: WorkPlanRequest) {
    try {
      return `This action returns all workPlan`;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  findAll() {
    try {
      return `This action returns all workPlan`;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  findOne(id: string) {
    try {
      return `This action returns all workPlan`;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  update(id: string, updateWorkPlanDto: UpdateWorkPlanDto) {
    try {
      return `This action returns all workPlan`;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  remove(id: string) {
    try {
      return `This action returns all workPlan`;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }
}
