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
} from '@nestjs/common';
import { FileStorageService } from './file-storage.service';
import { FileRequest } from './dto/create-file-storage.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileStorageMulterConfig } from 'storage-multer.config';
import { FileInfoResponse } from './dto/response.dto';

@Controller('file-storage')
export class FileStorageController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', FileStorageMulterConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileRequest })
  create(@UploadedFile() file: Express.Multer.File) {
    return this.fileStorageService.create(file);
  }

  @Get()
  findAll() {
    return this.fileStorageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileStorageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileStorageDto: string) {
    // return this.fileStorageService.update(+id, updateFileStorageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileStorageService.remove(+id);
  }
}
