import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CheckSheetService } from './check-sheet.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { MulterConfig } from 'multer.config';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOperation,
} from '@nestjs/swagger';

import {
  CheckedListDto,
  CreateInputDto,
  UpdateInputDto,
} from './check-sheet-request.dto';
import { SwaggerHelper } from 'src/helper/SwaggerHelper';
import {
  CheckedListResponse,
  CheckSheetResponse,
} from './check-sheet-response.dto';

@ApiExtraModels(CheckSheetResponse)
@Controller('check-sheet')
export class CheckSheetController {
  constructor(private checkSheetService: CheckSheetService) {}
  @Get('/info')
  @ApiOperation({
    summary: '작업 안전 점검표 GET API',
    description: '작업 안전 점검표',
  })
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(CheckSheetResponse, '작업 안전 점검표'),
  )
  async getCheckSheet() {
    const checkSheet = await this.checkSheetService.getCheckSheet();
    return checkSheet;
  }

  @Post('/info')
  @ApiOperation({
    summary: '작업 안전 점검표 생성 API',
    description: '작업 안전 점검표 생성',
  })
  @ApiBody({
    description:
      'Multipart Form Data로 데이터를 줄 때 객체 데이터는 직렬화 해서 줘야함(JSON.stringify()) 이유:멀티파트 폼 데이터는 바이너리 데이터를 전송하기 위해 설계되었으므로, 객체를 그대로 전송할 수 없음.',
    type: CreateInputDto,
  })
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(CheckSheetResponse, '작업 안전 점검표'),
  )
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor(MulterConfig))
  async createCheckSheet(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('checkSheetInfo') checkSheetInfo: string,
    @Body('checkLists') checkLists: string,
  ) {
    const createdCheckSheet = await this.checkSheetService.createCheckSheet(
      checkSheetInfo,
      checkLists,
      files,
    );
    return createdCheckSheet;
  }

  @Put('/info')
  @ApiOperation({
    summary: '작업 안전 점검표 수정 API',
    description: '작업 안전 점검표 수정',
  })
  @ApiBody({
    description:
      'Multipart Form Data로 데이터를 줄 때 객체 데이터는 직렬화 해서 줘야함(JSON.stringify()) 이유:멀티파트 폼 데이터는 바이너리 데이터를 전송하기 위해 설계되었으므로, 객체를 그대로 전송할 수 없음.',
    type: UpdateInputDto,
  })
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(CheckSheetResponse, '작업 안전 점검표'),
  )
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor(MulterConfig))
  async updateCheckSheet(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('checkSheetInfo') checkSheetInfo: string,
    @Body('checkLists') checkLists: string,
    @Body('originImagePaths') images: string,
  ) {
    const updatedCheckSheet = await this.checkSheetService.updateCheckSheet(
      checkSheetInfo,
      checkLists,
      images,
      files,
    );
    return updatedCheckSheet;
  }

  @Post('/checked-lists/item')
  @ApiOperation({
    summary: '안전 점검표 항목 체크 데이터(양호, 불량) 저장',
    description: '안전 점검표 항목 체크 데이터(양호, 불량) 저장',
  })
  @ApiBody({
    type: CheckedListDto,
  })
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(CheckedListResponse, '작업 안전 점검표'),
  )
  async createCheckedList(@Body() createCheckedListDto: CheckedListDto) {
    const item = await this.checkSheetService.createCheckedList(
      createCheckedListDto,
    );
    return item;
  }

  @Get('checked-lists/all')
  @ApiOperation({
    summary: '모든 날짜의 안전 점검표 항목 체크 데이터(양호, 불량) GET',
    description: '모든 날짜의 안전 점검표 항목 체크 데이터(양호, 불량) GET',
  })
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(CheckedListResponse, '작업 안전 점검표'),
  )
  async findCheckedLists() {
    return await this.checkSheetService.findCheckedLists();
  }

  @Get('/checked-lists/:date')
  @ApiOperation({
    summary: '해당 날짜의 안전 점검표 항목 체크 데이터(양호, 불량) GET',
  })
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(CheckedListResponse, ''),
  )
  async findCheckedList(@Param('date') date: string) {
    return await this.checkSheetService.findCheckedList(date);
  }

  @Put('checked-lists/:_id')
  @ApiOperation({
    summary: '해당 _id를 가진 안전 점검표 항목 체크 데이터(양호, 불량) 수정',
  })
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema(CheckedListResponse))
  async UpdateCheckedList(
    @Param('_id') _id: string,
    @Body() checkedListDto: CheckedListDto,
  ) {
    return this.checkSheetService.updateCheckedList(_id, checkedListDto);
  }

  @Delete('checked-lists/all')
  @ApiOperation({
    summary: '안전 점검표 항목 체크 데이터(양호, 불량) 전체 삭제',
    description: '안전 점검표 항목 체크 데이터(양호, 불량) 전체 삭제',
  })
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(null, '데이터 삭제 완료'),
  )
  async removeCheckedLists() {
    const translate = await this.checkSheetService.removeCheckedLists();
    return {
      translate,
    };
  }

  @Delete('checked-lists/:_id')
  @ApiOperation({
    summary: '해당 _id를 가진 안전 점검표 항목 체크 데이터(양호, 불량) 삭제',
  })
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema(null, ''))
  async removeCheckedList(@Param('_id') _id: string) {
    const translate = await this.checkSheetService.removeCheckedList(_id);
    return {
      translate,
    };
  }
}
