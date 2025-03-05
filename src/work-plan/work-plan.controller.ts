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
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from 'src/common-dto/pagination.dto';
import { WorkPlanResponse } from './dto/work-plan.response';

@ApiTags('작업 계획서')
@Controller('work-plans')
export class WorkPlanController {
  constructor(private readonly workPlanService: WorkPlanService) {}

  @Post()
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  @ApiBody({ type: WorkPlanRequest })
  async create(@Body() workPlanDto: WorkPlanRequest) {
    return { data: await this.workPlanService.create(workPlanDto) };
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
  @UseInterceptors(FileInterceptor('file'))
  async updateSignature(
    @Param('id') id: string,
    @Body() body: AdminSignatureRequest,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    return await this.workPlanService.adminSignature(id, body, file);
  }

  @Put(':id/driver-signature')
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  @ApiBody({ type: DriverSignatureRequest })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async driverSignature(
    @Param('id') id: string,
    @Body() body: DriverSignatureRequest,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    return await this.workPlanService.driverSignature(id, body, file);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.workPlanService.remove(id);
  }
}
