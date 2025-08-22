import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseInterceptors,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { WorkPlanService } from './work-plan.service';
import {
  AdminSignatureRequest,
  DriverSignatureRequest,
  WorkPlanDetailsRequest,
  WorkPlanPaginationDto,
  WorkPlanRequest,
} from './dto/work-plan.request';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerHelper } from 'src/helper/SwaggerHelper';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from 'src/common-dto/pagination.dto';
import { WorkPlanResponse } from './dto/work-plan.response';
import { ObjectIdValidationPipe } from 'src/pipes/objectid-validation.pipe';

@ApiTags('작업 계획서')
@Controller('work-plans')
export class WorkPlanController {
  constructor(private readonly workPlanService: WorkPlanService) {}

  @Post()
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  @ApiBody({ type: WorkPlanRequest })
  async create(@Body() body: WorkPlanRequest) {
    return { data: await this.workPlanService.create(body) };
  }

  @Get(':id')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(WorkPlanResponse, '', false, true),
  )
  @ApiResponse({ type: WorkPlanResponse })
  async findOne(@Param('id', ObjectIdValidationPipe) id: string) {
    return {
      data: await this.workPlanService.findOne(id),
    };
  }

  @Get(':equipmentId/including-today')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(WorkPlanResponse, '', false, true),
  )
  @ApiResponse({ type: WorkPlanResponse })
  async findTodayEntry(
    @Param('equipmentId', ObjectIdValidationPipe) id: string,
  ) {
    return {
      data: await this.workPlanService.findTodayEntry(id),
    };
  }

  @Get('equipment/:id')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(WorkPlanResponse, '', true, true),
  )
  async findAll(
    @Query() paginationDto: WorkPlanPaginationDto,
    @Param('id', ObjectIdValidationPipe) id: string,
  ) {
    // console.log('Pagination DTO:', paginationDto);
    return await this.workPlanService.findAll(id, paginationDto);
  }

  @Get('workPlan/:id/save')
  async saveCurrentWorkPlan(@Param('id', ObjectIdValidationPipe) id: string) {
    return await this.workPlanService.saveCurrentWorkPlan(id);
  }

  @Put(':id/details')
  async updateDetails(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() workPlanDto: WorkPlanDetailsRequest,
  ) {
    const result = await this.workPlanService.updateDetails(id, workPlanDto);
    return result;
  }

  @Put(':id/admin-signature')
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  @ApiBody({ type: AdminSignatureRequest })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'dark', maxCount: 1 }, // 첫 번째 파일 필드
      { name: 'white', maxCount: 1 }, // 두 번째 파일 필드
    ]),
  )
  async updateSignature(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() body: AdminSignatureRequest,
    @UploadedFiles()
    files: { dark?: Express.MulterS3.File[]; white?: Express.MulterS3.File[] },
  ) {
    return await this.workPlanService.adminSignature(id, body, files);
  }

  @Put(':id/driver-signature')
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  @ApiBody({ type: DriverSignatureRequest })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'dark', maxCount: 1 }, // 첫 번째 파일 필드
      { name: 'white', maxCount: 1 }, // 두 번째 파일 필드
    ]),
  )
  async driverSignature(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() body: DriverSignatureRequest,
    @UploadedFiles()
    files: { dark?: Express.MulterS3.File[]; white?: Express.MulterS3.File[] },
  ) {
    return await this.workPlanService.driverSignature(id, body, files);
  }

  @Delete(':id')
  async remove(@Param('id', ObjectIdValidationPipe) id: string) {
    return await this.workPlanService.remove(id);
  }
}
