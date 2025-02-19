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
} from '@nestjs/common';
import { WorkPlanService } from './work-plan.service';
import { WorkPlanRequest } from './dto/work-plan.request';
import { UpdateWorkPlanDto } from './dto/work-plan.response';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SwaggerHelper } from 'src/helper/SwaggerHelper';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('작업 계획서')
@Controller('work-plans')
export class WorkPlanController {
  constructor(private readonly workPlanService: WorkPlanService) {}

  @Post()
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  @ApiBody({ type: WorkPlanRequest })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  create(@Body() body: any, @UploadedFile() file: Express.MulterS3.File) {
    return this.workPlanService.create(body);
  }

  @Get()
  async findAll() {
    return await this.workPlanService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workPlanService.findOne(id);
  }

  @Put(':id')
  async update(
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
