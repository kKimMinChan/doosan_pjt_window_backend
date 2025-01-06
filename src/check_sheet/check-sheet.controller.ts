import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
  Response as resp,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CheckSheetService } from './check-sheet.service';
import { Response } from 'express';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { MulterConfig } from 'multer.config';
import { CheckedList } from './check-sheet.schema';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

import {
  CheckedListDto,
  CheckSheetOutputDto,
  CreateInputDto,
  UpdateInputDto,
} from './check-sheet.dto';

@Controller('check-sheet')
export class CheckSheetController {
  constructor(private checkSheetService: CheckSheetService) {}
  @Get()
  @ApiOperation({
    summary: '작업 안전 점검표 GET API',
    description: '작업 안전 점검표',
  })
  @ApiCreatedResponse({
    description: '작업 안전 점검표',
    type: CheckSheetOutputDto,
  })
  async getCheckSheet() {
    try {
      const checkSheet = await this.checkSheetService.getCheckSheet();
      if (!checkSheet) {
        // 데이터가 없는 경우 404 상태와 메시지 반환
        throw new HttpException(
          '작업 안전 점검표 데이터가 없습니다. 작업 안전 점검표 데이터를 추가해주세요.',
          HttpStatus.NOT_FOUND,
        );
      }
      return checkSheet;
    } catch (error) {
      console.error(error.message);
      // 에러를 클라이언트로 재발생시켜 전송
      throw new HttpException(
        error.response ||
          '작업 안전 점검표 데이터를 가져오는 중 문제가 발생했습니다.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: '작업 안전 점검표 생성 API',
    description: '작업 안전 점검표 생성',
  })
  @ApiBody({
    description:
      'Multipart Form Data로 데이터를 줄 때 객체 데이터는 직렬화 해서 줘야함(JSON.stringify()) 이유:멀티파트 폼 데이터는 바이너리 데이터를 전송하기 위해 설계되었으므로, 객체를 그대로 전송할 수 없음.',
    type: CreateInputDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor(MulterConfig))
  async createCheckSheet(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('checkSheetInfo') checkSheetInfo: string,
    @Body('checkLists') checkLists: string,
    @Res() response: Response,
  ) {
    try {
      const createdCheckSheet = await this.checkSheetService.createCheckSheet(
        checkSheetInfo,
        checkLists,
        files,
      );
      return response.status(201).json(createdCheckSheet);
    } catch (error) {
      console.error('Error:', error.message);
      throw new HttpException(`${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put()
  @ApiOperation({
    summary: '작업 안전 점검표 수정 API',
    description: '작업 안전 점검표 수정',
  })
  @ApiBody({
    description:
      'Multipart Form Data로 데이터를 줄 때 객체 데이터는 직렬화 해서 줘야함(JSON.stringify()) 이유:멀티파트 폼 데이터는 바이너리 데이터를 전송하기 위해 설계되었으므로, 객체를 그대로 전송할 수 없음.',
    type: UpdateInputDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor(MulterConfig))
  async updateCheckSheet(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('checkSheetInfo') checkSheetInfo: string,
    @Body('checkLists') checkLists: string,
    @Body('originImagePath') images: string,
    @Res() response: Response,
  ) {
    try {
      const updatedCheckSheet = await this.checkSheetService.updateCheckSheet(
        checkSheetInfo,
        checkLists,
        images,
        files,
      );
      return response.status(201).json(updatedCheckSheet);
    } catch (error) {
      console.error('Error:', error.message);
      throw new HttpException(`${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('checked-sheet')
  @ApiOperation({
    summary: '작업 안전 점검표(양호, 불량, 이슈사항) 작성 API',
    description: '작업 안전 점검표(양호, 불량, 이슈사항) 작성',
  })
  @ApiCreatedResponse({
    description: '작업 안전 점검표 작성 결과',
    type: CheckSheetOutputDto,
  })
  @ApiBody({
    type: CheckedListDto,
  })
  async recordSheet(@Body() body: CheckedList, @Res() response: Response) {
    try {
      const record = await this.checkSheetService.recordSheet(body);
      return response.status(201).json(record);
    } catch (error) {
      console.error('Error:', error.message);
      throw new HttpException(`${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('checked-sheet')
  @ApiOperation({
    summary: '작업 안전 점검표(양호, 불량, 이슈사항) 수정 API',
    description: '작업 안전 점검표(양호, 불량, 이슈사항) 수정',
  })
  @ApiCreatedResponse({
    description: '작업 안전 점검표 수정 결과',
    type: CheckSheetOutputDto,
  })
  @ApiBody({
    type: CheckedListDto,
  })
  async updateSheet(@Body() body, @Res() response: Response) {
    try {
      const checkItemDto: CheckedList = body;
      const record = await this.checkSheetService.updateSheet(checkItemDto);
      return response.status(201).json(record);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new HttpException(`${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}
