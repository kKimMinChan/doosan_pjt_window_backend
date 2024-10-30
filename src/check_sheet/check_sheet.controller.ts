import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Res,
  Response as resp,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CheckSheetService } from './check_sheet.service';
import { Response } from 'express';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { MulterConfig } from 'multer.config';
import {
  CheckList,
  CheckSheetInfo,
  CheckedList,
  // DriversImage,
} from './check_sheet.schema';

@Controller('check-sheet')
export class CheckSheetController {
  constructor(private checkSheetService: CheckSheetService) {}
  @Get()
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

  @Post('create')
  @UseInterceptors(AnyFilesInterceptor(MulterConfig))
  async createPost(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('checkSheetInfo') checkSheetInfo: string,
    @Body('checkLists') checkLists: string,
    @Body('originWorkSafetyCheckListPath') images: string[],
    @Res() response: Response,
  ) {
    try {
      const checkSheetData = await this.checkSheetService.getCheckSheet();

      const parsedCheckSheetInfo = JSON.parse(checkSheetInfo) as CheckSheetInfo;
      const parsedCheckLists = JSON.parse(checkLists) as CheckList[];

      const imageUrls = files
        .filter((file) => file.fieldname === 'newWorkSafetyCheckListFiles')
        .map((file) => ({ image_url: file.path }));

      const checkSheetDto = {
        checkSheetInfo: parsedCheckSheetInfo,
        checkLists: parsedCheckLists,
        image: imageUrls,
        checkedList: [],
      };

      if (images?.length > 0) {
        checkSheetDto.image = [
          ...images.map((imgUrl) => ({
            image_url: imgUrl,
          })),
          ...imageUrls,
        ];
      }

      if (!checkSheetDto) {
        return response.status(400).json({ message: 'Bad Request' });
      }

      const createdCheckSheet = await this.checkSheetService.createCheckSheet(
        checkSheetDto,
      );
      // return response.status(401).json({ message: 'error' });
      return response.status(201).json(createdCheckSheet);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return response.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Post('record')
  async recordSheet(@Body() body, @Res() response: Response) {
    try {
      const checkItemDto: CheckedList = body;
      const record = await this.checkSheetService.recordSheet(checkItemDto);
      console.log(record, 'cont');
      return response.status(201).json(record);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return response.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Put('updateSheet')
  async updateSheet(@Body() body, @Res() response: Response) {
    try {
      const checkItemDto: CheckedList = body;
      const record = await this.checkSheetService.updateSheet(checkItemDto);
      return response.status(201).json(record);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return response.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
