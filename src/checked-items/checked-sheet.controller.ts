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
import { CheckedSheetService } from './checked-sheet.service';
import {
  CheckedItemRequest,
  CheckedListResponse,
} from './dto/checked-sheet.request';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('[관리자] 점검된 항목')
@Controller('checked-items')
export class CheckedSheetController {
  constructor(private readonly checkedSheetService: CheckedSheetService) {}

  @Post(':id')
  @ApiOperation({
    summary: '안전 점검표 데이터 저장 (id는 checkSheet id)',
    description: '안전 점검표 데이터 저장',
  })
  @ApiBody({
    type: CheckedItemRequest,
  })
  async create(
    @Param('id') id: string,
    @Body() createCheckedListDto: CheckedItemRequest,
  ) {
    // console.log(createCheckedListDto);
    // const item = await this.checkedSheetService.create(
    //   id,
    //   createCheckedListDto,
    // );
    // console.log(item);
    // return item;
  }

  // @Get('all')
  // async findAll() {
  //   return await this.checkedSheetService.findAll();
  // }

  // @Get('item/:date')
  // findOne(@Param('date') date: string) {
  //   console.log(date);
  //   return this.checkedSheetService.findOne(date);
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.checkedSheetService.findOne(+id);
  // }

  // @Patch(':_id')
  // @ApiOperation({
  //   summary: '안전 점검표 데이터 수정',
  // })
  // @ApiCreatedResponse({
  //   description: '업데이트 성공 데이터 반환',
  //   type: CheckedListResponse,
  // })
  // update(
  //   @Param('_id') _id: string,
  //   @Body() checkedListDto: CheckedItemRequest,
  // ) {
  //   return this.checkedSheetService.update(_id, checkedListDto);
  // }

  // @Delete('all')
  // async removeAll() {
  //   return await this.checkedSheetService.removeAll();
  // }

  // @Delete(':_id')
  // remove(@Param('_id') _id: string) {
  //   return this.checkedSheetService.remove(_id);
  // }
}
