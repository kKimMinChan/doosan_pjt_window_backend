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
import { RecordingService } from './recording.service';
import { RecordingRequest } from './dto/recording.request';
import { RecordingResponse } from './dto/recording.response';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SwaggerHelper } from 'src/helper/SwaggerHelper';

@ApiTags('녹화 설정')
@Controller('configuration/recording')
export class RecordingController {
  constructor(private readonly recordingService: RecordingService) {}

  // @Post()
  // create(@Body() createRecordingDto: CreateRecordingDto) {
  //   return this.recordingService.create(createRecordingDto);
  // }

  @Get()
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(RecordingResponse, '', false, true),
  )
  @ApiResponse({ type: RecordingResponse })
  async findAll() {
    const data = await this.recordingService.findAll();
    console.log(data);
    return {
      data,
    };
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.recordingService.findOne(+id);
  // }

  @Put()
  async update(@Body() updateRecordingDto: RecordingRequest) {
    return await this.recordingService.update(updateRecordingDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.recordingService.remove(+id);
  // }
}
