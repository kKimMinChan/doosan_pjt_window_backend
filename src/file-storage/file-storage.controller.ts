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
  UploadedFiles,
} from '@nestjs/common';
import { FileStorageService } from './file-storage.service';
import { FileRequest, FilesRequest } from './dto/create-file-storage.dto';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileStorageMulterConfig } from 'storage-multer.config';
import { FileInfoResponse } from './dto/response.dto';

@Controller('file-storage')
export class FileStorageController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  // @Post()
  // @UseInterceptors(FileInterceptor('file', FileStorageMulterConfig))
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({ type: FileRequest })
  // create(@UploadedFile() file: Express.Multer.File) {
  //   return this.fileStorageService.create(file);
  // }

  @Post()
  @ApiBody({ type: FilesRequest })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor(FileStorageMulterConfig))
  async DriverImage(@UploadedFiles() files: Express.Multer.File[]) {
    const aaa = await this.fileStorageService.create(files);
    return aaa;
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

  @Delete('all')
  async removeAll() {
    return {
      translate: await this.fileStorageService.removeAll(),
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.fileStorageService.remove(id);
  }
}
