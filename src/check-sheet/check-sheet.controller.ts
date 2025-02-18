import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { CheckSheetService } from './check-sheet.service';
import {
  CheckSheetRequest,
  UpdateCheckSheetRequest,
} from './dto/check-sheet.request';
import { PaginationDto } from 'src/common-dto/pagination.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('안전 점검표')
@Controller('check-sheets')
export class CheckSheetController {
  constructor(private readonly checkSheetService: CheckSheetService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  async create(
    @UploadedFiles() files: Express.MulterS3.File[],
    @Body() body: any,
  ) {
    return await this.checkSheetService.create(body, files);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      data: await this.checkSheetService.findOne(id),
    };
  }

  @Get(':heavyEquipmentId/latest')
  async findOneLatest(@Param('heavyEquipmentId') id: string) {
    return {
      data: await this.checkSheetService.findOneLatest(id),
    };
  }

  @Get('/heavyEquipment/:id')
  async findAll(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.checkSheetService.findAll(id, paginationDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCheckSheetRequest,
  ) {
    return this.checkSheetService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.checkSheetService.remove(id);
  }
}
