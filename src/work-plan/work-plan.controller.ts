import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MulterConfig } from 'multer.config';
import { WorkPlanService } from './work-plan.service';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  InputImageFileDto,
  InputSignatureDto,
  InputUpdateDriverImagesDto,
  WorkPlanDto,
} from './swagger.dto';

@Controller('work-plan')
export class WorkPlanController {
  constructor(private workPlanService: WorkPlanService) {}

  @Get()
  @ApiOperation({
    summary: '작업 계획서 API',
    description: '작업 계획 데이터',
  })
  @ApiCreatedResponse({
    description: '작업 계획서 데이터',
    type: WorkPlanDto,
  })
  async getWorkPlan() {
    try {
      const workPlan = await this.workPlanService.getWorkPlan();
      if (!workPlan) {
        // 데이터가 없는 경우 404 상태와 메시지 반환
        throw new HttpException(
          '작업 계획서 데이터가 없습니다. 작업 계획서를 추가해주세요.',
          HttpStatus.NOT_FOUND,
        );
      }
      return workPlan;
    } catch (error) {
      console.error(error.message);
      throw new HttpException(
        error.response ||
          '작업 계획서 데이터를 가져오는 중 문제가 발생했습니다.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: '작업 계획서 이미지 생성 API',
    description: '이미지 파일을 업로드합니다.',
  })
  @ApiBody({
    description: '작업 계획서 이미지 파일 업로드',
    type: InputImageFileDto,
  })
  @ApiConsumes('multipart/form-data') // 요청 형식이 multipart/form-data임을 명시
  @UseInterceptors(FileInterceptor('workPlanFile', MulterConfig))
  async CreateWorkPlan(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response,
  ) {
    const createWorkPlan = this.workPlanService.createWorkPlan(file);
    return response.status(201).json(createWorkPlan);
  }

  // 운전자 명단은 변경되고, 작업 계획서 이미지는 변경되지 않았을 때 -> 작업 계획서에 있는 운전자 명단 업데이트
  @Put('driver-list')
  @ApiOperation({
    summary: '작업 계획서 운전자 명단 업데이트 API',
    description:
      '운전자 명단은 변경되고, 작업 계획서 이미지는 변경되지 않았을 때 -> 작업 계획서에 있는 운전자 명단 업데이트',
  })
  @ApiBody({
    description: '작업 계획서 image_url',
    type: InputUpdateDriverImagesDto,
  })
  async updatedDriver(
    @Body('originWorkPlanPath') originWorkPlanPath: string,
    @Res() response: Response,
  ) {
    try {
      const updatedDriver = await this.workPlanService.updatedDriver(
        originWorkPlanPath,
      );
      return response.status(201).json(updatedDriver);
    } catch (error) {
      console.error('Error fetching WorkPlan', error);
    }
  }

  @Put('new-week')
  @ApiOperation({
    summary: '새로운 주 월요일 작업 계획서 서명 리셋',
    description: '새로운 주 월요일에 작성 계획서에 서명을 다시해야되기 때문',
  })
  @ApiBody({
    description: '작업 계획서 image_url',
    type: InputUpdateDriverImagesDto,
  })
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

  @Post('signature')
  @ApiOperation({
    summary: '작업 계획서 서명 API',
    description: '기안, 결재, 승인, 운전자 서명',
  })
  @ApiBody({
    description: '서명 이미지',
    type: InputSignatureDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', MulterConfig))
  async signatureImage(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response,
    @Body('type') type: string,
    @Body('name') name: string,
  ) {
    const signature = await this.workPlanService.signature(
      file.path,
      type,
      name,
    );

    return response.status(201).json(signature);
  }

  @Get('excel')
  async workPlanToExcel(@Res() res: Response) {
    try {
      const buffer = await this.workPlanService.workPlanToExcel();

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=workplan_with_images.xlsx',
      );
      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      console.error(error.message);
      throw new HttpException(
        error.response ||
          '작업 계획서 데이터를 가져오는 중 문제가 발생했습니다.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
