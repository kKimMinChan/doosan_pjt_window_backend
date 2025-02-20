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
  UpdateWorkPlanRequest,
  WorkPlanRequest,
} from './dto/work-plan.request';
import { UpdateWorkPlanDto } from './dto/work-plan.response';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerHelper } from 'src/helper/SwaggerHelper';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from 'src/common-dto/pagination.dto';

@ApiTags('작업 계획서')
@Controller('work-plans')
export class WorkPlanController {
  constructor(private readonly workPlanService: WorkPlanService) {}

  @Post()
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  @ApiBody({ type: WorkPlanRequest })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async create(@Body() body: any, @UploadedFile() file: Express.MulterS3.File) {
    console.log(file);
    return { data: await this.workPlanService.create(body, file) };
  }

  @Get('heavyEquipment/:id')
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Param('id') id: string,
  ) {
    return await this.workPlanService.findAll(id, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      data: await this.workPlanService.findOne(id),
    };
  }

  @Put('/heavyEquipment/:id')
  async register(@Param('id') id: string) {}

  @Put(':id')
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  @ApiBody({ type: UpdateWorkPlanRequest })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async updateSignature(
    @Param('id') id: string,
    @Body() body: UpdateWorkPlanRequest,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    return await this.workPlanService.updateSignature(id, body, file);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.workPlanService.remove(id);
  }
}
