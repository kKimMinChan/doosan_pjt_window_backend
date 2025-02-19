import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { WorkPlanService } from './work-plan.service';
import { WorkPlanRequest } from './dto/work-plan.request';
import { UpdateWorkPlanDto } from './dto/work-plan.response';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('작업 계획서')
@Controller('work-plans')
export class WorkPlanController {
  constructor(private readonly workPlanService: WorkPlanService) {}

  @Post()
  create(@Body() workPlanDto: WorkPlanRequest) {
    return this.workPlanService.create(workPlanDto);
  }

  @Get()
  findAll() {
    return this.workPlanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workPlanService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkPlanDto: UpdateWorkPlanDto,
  ) {
    return this.workPlanService.update(id, updateWorkPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workPlanService.remove(id);
  }
}
