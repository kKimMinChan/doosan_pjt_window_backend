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
import { CameraBeIpRequest, RecordingRequest } from './dto/recording.request';
import { RecordingResponse } from './dto/recording.response';
import { ApiCreatedResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SwaggerHelper } from 'src/helper/SwaggerHelper';

@ApiTags('녹화 설정')
@Controller('configuration')
export class RecordingController {
  constructor(private readonly recordingService: RecordingService) {}

  // @Post()
  // create(@Body() createRecordingDto: CreateRecordingDto) {
  //   return this.recordingService.create(createRecordingDto);
  // }

  @Get('/recording-ips')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(RecordingResponse, '', false, true),
  )
  @ApiResponse({ type: RecordingResponse })
  async findAll() {
    const data = await this.recordingService.findAll();
    return {
      data,
    };
  }

  @Put('/recording-ips')
  async update(@Body() updateRecordingDto: RecordingRequest) {
    console.log(updateRecordingDto, ' 0----');
    return await this.recordingService.update(updateRecordingDto);
  }

  @Delete('/recording-ips')
  remove() {
    return this.recordingService.remove();
  }

  @Get('/camera-be')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(CameraBeIpRequest, '', false, true),
  )
  @ApiResponse({ type: CameraBeIpRequest })
  async findCameraBe() {
    const data = await this.recordingService.findAll();
    return {
      data,
    };
  }

  @Put('/camera-be')
  async updateCameraBe(@Body() updateRecordingDto: CameraBeIpRequest) {
    console.log(updateRecordingDto, ' 0----');
    return await this.recordingService.updateCameraBe(updateRecordingDto);
  }

  @Delete('/camera-be')
  removeCameraBe() {
    return this.recordingService.removeCameraBe();
  }
}
