import { PartialType } from '@nestjs/swagger';
import { WorkPlanRequest } from './work-plan.request';

export class UpdateWorkPlanDto extends PartialType(WorkPlanRequest) {}
