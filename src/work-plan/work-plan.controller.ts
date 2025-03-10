import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import { WorkPlanService } from './work-plan.service';
import {
  AdminSignatureRequest,
  DriverSignatureRequest,
  WorkPlanDetailsRequest,
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
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { PaginationDto } from 'src/common-dto/pagination.dto';
import { WorkPlanResponse } from './dto/work-plan.response';

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
  async findOne(@Param('id') id: string) {
    return {
      data: await this.workPlanService.findOne(id),
    };
  }

  @Get(':equipmentId/latest')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(WorkPlanResponse, '', false, true),
  )
  @ApiResponse({ type: WorkPlanResponse })
  async findOneLatest(@Param('equipmentId') id: string) {
    return {
      data: await this.workPlanService.findOneLatest(id),
    };
  }

  @Get('heavyEquipment/:id')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(WorkPlanResponse, '', true, true),
  )
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Param('id') id: string,
  ) {
    return await this.workPlanService.findAll(id, paginationDto);
  }

  @Put(':id/details')
  async updateDetails(
    @Param('id') id: string,
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
    @Param('id') id: string,
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
    @Param('id') id: string,
    @Body() body: DriverSignatureRequest,
    @UploadedFiles()
    files: { dark?: Express.MulterS3.File[]; white?: Express.MulterS3.File[] },
  ) {
    return await this.workPlanService.driverSignature(id, body, files);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.workPlanService.remove(id);
  }
}
