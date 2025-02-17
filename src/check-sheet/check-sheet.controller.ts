import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CheckSheetService } from './check-sheet.service';
import { CheckSheetRequest } from './dto/check-sheet.request';

@Controller('check-sheet')
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

  @Get(':heavyEquipmentId')
  async findAll(@Param('id') id: string) {
    return this.checkSheetService.findAll();
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
