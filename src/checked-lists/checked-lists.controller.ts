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
import { CheckedListsService } from './checked-lists.service';
import {
  CheckedListDto,
  CheckedListResponse,
} from './dto/create-checked-list.dto';
import { ApiBody, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';

@Controller('checked-lists')
export class CheckedListsController {
  constructor(private readonly checkedListsService: CheckedListsService) {}

  @Post('/item')
  @ApiOperation({
    summary: '안전 점검표 데이터 저장',
    description: '안전 점검표 데이터 저장',
  })
  @ApiBody({
    type: CheckedListDto,
  })
  async create(@Body() createCheckedListDto: CheckedListDto) {
    console.log(createCheckedListDto);
    const item = await this.checkedListsService.create(createCheckedListDto);
    console.log(item);
    return item;
  }

  @Get('all')
  async findAll() {
    return await this.checkedListsService.findAll();
  }

  @Get('item/:date')
  findOne(@Param('date') date: string) {
    console.log(date);
    return this.checkedListsService.findOne(date);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.checkedListsService.findOne(+id);
  // }

  @Patch(':_id')
  @ApiOperation({
    summary: '안전 점검표 데이터 수정',
  })
  @ApiCreatedResponse({
    description: '업데이트 성공 데이터 반환',
    type: CheckedListResponse,
  })
  update(@Param('_id') _id: string, @Body() checkedListDto: CheckedListDto) {
    return this.checkedListsService.update(_id, checkedListDto);
  }

  @Delete('all')
  async removeAll() {
    return await this.checkedListsService.removeAll();
  }

  @Delete(':_id')
  remove(@Param('_id') _id: string) {
    return this.checkedListsService.remove(_id);
  }
}
