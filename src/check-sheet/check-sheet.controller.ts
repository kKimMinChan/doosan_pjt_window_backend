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
import { CheckSheetService } from './check-sheet.service';
import { CheckSheetRequest } from './dto/check-sheet.request';
import { PaginationDto } from 'src/common-dto/pagination.dto';

@Controller('check-sheets')
export class CheckSheetController {
  constructor(private readonly checkSheetService: CheckSheetService) {}

  @Post()
  async create(@Body() checkSheetDto: CheckSheetRequest) {
    return await this.checkSheetService.create(checkSheetDto);
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

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCheckSheetDto: CheckSheetRequest,
  ) {
    return this.checkSheetService.update(id, updateCheckSheetDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.checkSheetService.remove(id);
  }
}
