import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { LogsService } from './logs.service';
import { UserLogPaginationDto, UserLogRequest } from './dto/log.request';
import { UserLogResponse } from './dto/log.response';
import { ApiConsumes, ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import { SwaggerHelper } from 'src/helper/SwaggerHelper';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user-logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() createLogDto: UserLogRequest,
    @UploadedFile() file: Express.MulterS3.File,
  ) {
    return this.logsService.create(createLogDto, file);
  }

  @Get()
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(UserLogResponse, '', true, true),
  )
  @ApiResponse({ type: UserLogResponse })
  async findAll(@Query() userLogPaginationDto: UserLogPaginationDto) {
    const userLogs = await this.logsService.findAll(userLogPaginationDto);
    return userLogs;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.logsService.remove(+id);
  }
}
