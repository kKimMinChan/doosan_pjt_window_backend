import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SystemStatusService } from './system-status.service';
import { SystemStatusRequest } from './dto/system-status.request';
import { ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import { SwaggerHelper } from 'src/helper/SwaggerHelper';
import { SystemStatusResponse } from './dto/system-status.response';

@Controller('system-status')
export class SystemStatusController {
  constructor(private readonly systemStatusService: SystemStatusService) {}

  // @Post()
  // create(@Body() createSystemStatusDto: CreateSystemStatusDto) {
  //   return this.systemStatusService.create(createSystemStatusDto);
  // }

  @Get()
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(SystemStatusResponse, '', false, true),
  )
  @ApiResponse({ type: SystemStatusResponse })
  async update(@Query() systemStatusRequest: SystemStatusRequest) {
    const systemStatus =
      await this.systemStatusService.update(systemStatusRequest);
    return {
      data: systemStatus,
    };
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.systemStatusService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateSystemStatusDto: UpdateSystemStatusDto,
  // ) {
  //   return this.systemStatusService.update(+id, updateSystemStatusDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.systemStatusService.remove(+id);
  // }
}
