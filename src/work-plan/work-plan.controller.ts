import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MulterConfig } from 'multer.config';
import { WorkPlanService } from './work-plan.service';

@Controller('work-plan')
export class WorkPlanController {
  constructor(private workPlanService: WorkPlanService) {}

  @Get()
  async getWorkPlan() {
    try {
      const workPlan = await this.workPlanService.getWorkPlan();
      return workPlan;
    } catch (error) {
      console.error('Error fetching WorkPlan', error);
    }
  }

  @Post('createWorkPlan')
  @UseInterceptors(FileInterceptor('workPlanFile', MulterConfig))
  async CreateWorkPlan(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response,
  ) {
    const createWorkPlan = this.workPlanService.createWorkPlan(file);
    return response.status(201).json(createWorkPlan);
  }

  @Post('updatedDriver')
  async updatedDriver(
    @Body('originWorkPlanPath') originWorkPlanPath: string,
    @Res() response: Response,
  ) {
    try {
      console.log(originWorkPlanPath, 'cont');
      const updatedDriver = await this.workPlanService.updatedDriver(
        originWorkPlanPath,
      );
      return response.status(201).json(updatedDriver);
    } catch (error) {
      console.error('Error fetching WorkPlan', error);
    }
  }

  @Post('newWeekWorkPlan')
  async newWeekWorkPlan(
    @Body('originWorkPlanPath') originWorkPlanPath: string,
    @Res() response: Response,
  ) {
    try {
      console.log(originWorkPlanPath, 'cont');
      const newWorkPlan = await this.workPlanService.newWeekWorkPlan(
        originWorkPlanPath,
      );
      return response.status(201).json(newWorkPlan);
    } catch (error) {
      console.error('Error fetching WorkPlan', error);
    }
  }

  // @Post('remake')

  @Post('signature')
  @UseInterceptors(FileInterceptor('file', MulterConfig))
  async signatureImage(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response,
    @Body('type') type: string,
    @Body('name') name: string,
  ) {
    if (name) {
      const signature = await this.workPlanService.signature(
        file.path,
        type,
        name,
      );
      // console.log(JSON.stringify(signature, null, 2));
      return response.status(201).json(signature);
    }
    const signature = await this.workPlanService.signature(file.path, type);
    console.log(JSON.stringify(signature, null, 2));
    return response.status(201).json(signature);
  }
}
