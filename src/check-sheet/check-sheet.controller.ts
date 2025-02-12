import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import {
  CheckItemRequest,
  CheckItemsRequest,
  CheckSheetRequest,
  UpdateCheckItem,
} from './check-sheet-request.dto';
import { SwaggerHelper } from 'src/helper/SwaggerHelper';

import { PaginationDto } from 'src/common-dto/pagination.dto';
import { CheckSheetInfoResponse } from './check-sheet-response.dto';

@ApiTags('[관리자] 중장비 유형별 안전 점검표 정보')
@ApiExtraModels(CheckSheetInfoResponse)
@Controller('check-sheet-infos')
export class CheckSheetController {
  constructor(private checkSheetService: CheckSheetService) {}
  @Post(':type')
  @ApiOperation({
    summary: '중장비 유형별 안전 점검표 생성 API',
    description: '중장비 유형별 안전 점검표 생성',
  })
  @ApiBody({
    description:
      'Multipart Form Data로 데이터를 줄 때 객체 데이터는 직렬화 해서 줘야함(JSON.stringify()) 이유:멀티파트 폼 데이터는 바이너리 데이터를 전송하기 위해 설계되었으므로, 객체를 그대로 전송할 수 없음.',
    type: CheckSheetRequest,
  })
  @ApiParam({
    name: 'type',
    required: true,
    enum: ['지게차', '대차', '크레인'],
    description: '중장비의 유형 (지게차, 대차, 크레인 중 하나)',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor(MulterConfig))
  async createCheckSheet(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
    @Param('type') type: '지게차' | '대차' | '크레인',
  ) {
    await this.checkSheetService.createCheckSheetInfo(type, body, files);
    return {
      translate: '요청이 성공적으로 처리되었습니다.',
    };
  }

  @Post('/checkItems/:type')
  @ApiOperation({
    summary: '중장비 유형별 안전 점검표 항목 생성 API',
    description: '중장비 유형별 안전 점검표 항목 생성',
  })
  @ApiBody({
    type: CheckItemsRequest,
  })
  @ApiParam({
    name: 'type',
    required: true,
    enum: ['지게차', '대차', '크레인'],
    description: '중장비의 유형 (지게차, 대차, 크레인 중 하나)',
  })
  async createCheckItems(
    @Body() body: CheckItemsRequest,
    @Param('type') type: '지게차' | '대차' | '크레인',
  ) {
    await this.checkSheetService.createCheckItems(type, body);
    return {
      translate: '요청이 성공적으로 처리되었습니다.',
    };
  }

  @Put('/checkItems/:type')
  @ApiOperation({
    summary: '중장비 유형별 안전 점검표 항목 수정',
    description: '중장비 유형별 안전 점검표 항목 수정',
  })
  @ApiBody({
    type: CheckItemsRequest,
  })
  @ApiParam({
    name: 'type',
    required: true,
    enum: ['지게차', '대차', '크레인'],
    description: '중장비의 유형 (지게차, 대차, 크레인 중 하나)',
  })
  async updateCheckItems(
    @Body() body: CheckItemsRequest,
    @Param('type') type: '지게차' | '대차' | '크레인',
  ) {
    await this.checkSheetService.createCheckItems(type, body);
    return {
      translate: '요청이 성공적으로 처리되었습니다.',
    };
  }

  @Get()
  @ApiOperation({
    summary: '작업 안전 점검표 GET API',
    description: '작업 안전 점검표',
  })
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(
      CheckSheetInfoResponse,
      '작업 안전 점검표',
    ),
  )
  async findAll(@Query() paginationDto: PaginationDto) {
    const checkSheet = await this.checkSheetService.findAll(paginationDto);
    return checkSheet;
  }

  @Get(':type')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(CheckSheetInfoResponse, ''),
  )
  @ApiParam({
    name: 'type',
    required: true,
    enum: ['지게차', '대차', '크레인'],
    description: '중장비의 유형 (지게차, 대차, 크레인 중 하나)',
  })
  async findOne(@Param('type') type: '지게차' | '대차' | '크레인') {
    const checkSheetInfo = await this.checkSheetService.findOne(type);
    return { data: [checkSheetInfo] };
  }

  @Get('/checkItems/type/:type')
  @ApiParam({
    name: 'type',
    required: true,
    enum: ['지게차', '대차', '크레인'],
    description: '중장비의 유형 (지게차, 대차, 크레인 중 하나)',
  })
  async findAllCheckItems(@Param('type') type: '지게차' | '대차' | '크레인') {
    const checkItems = await this.checkSheetService.findAllCheckItems(type);
    return { data: [checkItems] };
  }

  @Post('/checkItems/item/:type')
  @ApiParam({
    name: 'type',
    required: true,
    enum: ['지게차', '대차', '크레인'],
    description: '중장비의 유형 (지게차, 대차, 크레인 중 하나)',
  })
  async createCheckItem(
    @Param('type') type: '지게차' | '대차' | '크레인',
    @Body() checkItemDto: CheckItemRequest,
  ) {
    const checkItem = await this.checkSheetService.createCheckItem(
      type,
      checkItemDto,
    );

    return {
      translate: '요청이 성공적으로 처리되었습니다.',
    };
  }

  @Get('/checkItems/:id')
  @ApiParam({
    name: 'id',
    required: true,
  })
  async findOneCheckItem(
    @Param('id') id: string, // `id`는 string으로 전달됨 → 숫자로 변환 필요
  ) {
    const checkItem = await this.checkSheetService.findOneCheckItem(id);

    return { data: [checkItem] };
  }

  @Put('/checkItems/:id')
  @ApiParam({
    name: 'id',
    required: true,
  })
  @ApiBody({ type: UpdateCheckItem })
  async updateOneCheckItem(
    @Param('id') id: string,
    @Body() checkItemDto: UpdateCheckItem,
  ) {
    const checkItem = await this.checkSheetService.updateOneCheckItem(
      id,
      checkItemDto,
    );

    return {
      translate: '요청이 성공적으로 처리되었습니다.',
    };
  }

  @Delete('/checkItems/:id')
  @ApiParam({
    name: 'id',
    required: true,
  })
  async removeCheckItem(@Param('id') id: string) {
    await this.checkSheetService.removeCheckItem(id);
    return {
      translate: '요청이 성공적으로 처리되었습니다.',
    };
  }

  // @Put(':id')
  // @ApiOperation({
  //   summary: '작업 안전 점검표 수정 API',
  //   description: '작업 안전 점검표 수정',
  // })
  // @ApiBody({
  //   description:
  //     'Multipart Form Data로 데이터를 줄 때 객체 데이터는 직렬화 해서 줘야함(JSON.stringify()) 이유:멀티파트 폼 데이터는 바이너리 데이터를 전송하기 위해 설계되었으므로, 객체를 그대로 전송할 수 없음.',
  //   type: UpdateCheckSheetRequest,
  // })
  // @ApiCreatedResponse(
  //   SwaggerHelper.getApiResponseSchema(CheckSheetResponse, '작업 안전 점검표'),
  // )
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(AnyFilesInterceptor(MulterConfig))
  // async updateCheckSheet(
  //   @Param('id') id: string,
  //   @UploadedFiles() files: Express.Multer.File[],
  //   @Body() body: any,
  // ) {
  //   const updatedCheckSheet = await this.checkSheetService.updateCheckSheet(
  //     id,
  //     body,
  //     files,
  //   );
  //   return updatedCheckSheet;
  // }

  // @Post('/checked-lists/item')
  // @ApiOperation({
  //   summary: '안전 점검표 항목 체크 데이터(양호, 불량) 저장',
  //   description: '안전 점검표 항목 체크 데이터(양호, 불량) 저장',
  // })
  // @ApiBody({
  //   type: CheckedListDto,
  // })
  // @ApiCreatedResponse(
  //   SwaggerHelper.getApiResponseSchema(CheckedListResponse, '작업 안전 점검표'),
  // )
  // async createCheckedList(@Body() createCheckedListDto: CheckedListDto) {
  //   const item = await this.checkSheetService.createCheckedList(
  //     createCheckedListDto,
  //   );
  //   return item;
  // }

  // @Get('checked-lists/all')
  // @ApiOperation({
  //   summary: '모든 날짜의 안전 점검표 항목 체크 데이터(양호, 불량) GET',
  //   description: '모든 날짜의 안전 점검표 항목 체크 데이터(양호, 불량) GET',
  // })
  // @ApiCreatedResponse(
  //   SwaggerHelper.getApiResponseSchema(CheckedListResponse, '작업 안전 점검표'),
  // )
  // async findCheckedLists() {
  //   return await this.checkSheetService.findCheckedLists();
  // }

  // @Get('/checked-lists/:date')
  // @ApiOperation({
  //   summary: '해당 날짜의 안전 점검표 항목 체크 데이터(양호, 불량) GET',
  // })
  // @ApiCreatedResponse(
  //   SwaggerHelper.getApiResponseSchema(CheckedListResponse, ''),
  // )
  // async findCheckedList(@Param('date') date: string) {
  //   return await this.checkSheetService.findCheckedList(date);
  // }

  // @Put('checked-lists/:_id')
  // @ApiOperation({
  //   summary: '해당 _id를 가진 안전 점검표 항목 체크 데이터(양호, 불량) 수정',
  // })
  // @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema(CheckedListResponse))
  // async UpdateCheckedList(
  //   @Param('_id') _id: string,
  //   @Body() checkedListDto: CheckedListDto,
  // ) {
  //   return this.checkSheetService.updateCheckedList(_id, checkedListDto);
  // }

  // @Delete('checked-lists/all')
  // @ApiOperation({
  //   summary: '안전 점검표 항목 체크 데이터(양호, 불량) 전체 삭제',
  //   description: '안전 점검표 항목 체크 데이터(양호, 불량) 전체 삭제',
  // })
  // @ApiCreatedResponse(
  //   SwaggerHelper.getApiResponseSchema(null, '데이터 삭제 완료'),
  // )
  // async removeCheckedLists() {
  //   const translate = await this.checkSheetService.removeCheckedLists();
  //   return {
  //     translate,
  //   };
  // }

  // @Delete('checked-lists/:_id')
  // @ApiOperation({
  //   summary: '해당 _id를 가진 안전 점검표 항목 체크 데이터(양호, 불량) 삭제',
  // })
  // @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema(null, ''))
  // async removeCheckedList(@Param('_id') _id: string) {
  //   const translate = await this.checkSheetService.removeCheckedList(_id);
  //   return {
  //     translate,
  //   };
  // }
}
