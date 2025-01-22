import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CheckSheetMongoRepository,
  DuplicateDateError,
  ResourceNotFoundError,
} from './check-sheet.repository';
import * as fs from 'fs';
import { promisify } from 'util';
import { CheckedListDto, DateDto } from './check-sheet-request.dto';
import { validateSync } from 'class-validator';
import mongoose from 'mongoose';
import { ErrorHelper } from 'src/helper/ErrorHelper';

const readFile = promisify(fs.readFile);

@Injectable()
export class CheckSheetService {
  constructor(private checkSheetRepository: CheckSheetMongoRepository) {}

  async getBase64Image(imageUrl: string) {
    try {
      if (!imageUrl) {
        throw new Error('image_url이 없습니다.');
      }
      const imageBuffer = await readFile(imageUrl);
      return {
        base64: `data:image/png;base64,${imageBuffer.toString('base64')}`,
        image_url: imageUrl,
      };
    } catch (error) {
      console.error(`Error reading file at ${imageUrl}: ${error}`);
    }
  }

  async getCheckSheet() {
    try {
      const checkSheetData = await this.checkSheetRepository.getCheckSheet();
      if (!checkSheetData) {
        // 데이터가 없는 경우 404 상태와 메시지 반환
        throw new HttpException(
          '작업 안전 점검표 데이터가 없습니다. 작업 안전 점검표 데이터를 추가해주세요.',
          HttpStatus.NOT_FOUND,
        );
      }

      console.log(checkSheetData);

      if (checkSheetData?.imageUrls.length > 0) {
        const imageUrls = checkSheetData?.imageUrls?.map((image, index) =>
          image.image_url.replace(/^"|"$/g, ''),
        );

        // 모든 이미지 파일을 비동기적으로 읽고 Base64로 인코딩
        const imagesBase64 = await Promise.all(
          imageUrls.map(async (imagePath) => {
            const imageBuffer = await readFile(imagePath);
            return {
              base64: `data:image/png;base64,${imageBuffer.toString('base64')}`,
              image_url: imagePath,
            };
          }),
        );

        // 이미지 데이터를 checkSheetData 객체에 저장하거나 반환
        checkSheetData.imageUrls = imagesBase64.map((base64, _) => base64);
      }

      const date = new Date();
      const today = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

      if (today !== checkSheetData?.todayCheckedList?.date)
        checkSheetData.todayCheckedList = null;

      return checkSheetData;
    } catch (error) {
      console.error(error);
      ErrorHelper.handleError(error);
    }
  }

  async createCheckSheet(
    checkSheetInfo: string,
    checkLists: string,
    files: Express.Multer.File[],
  ): Promise<any> {
    try {
      const checkSheet = this.checkSheetRepository.getCheckSheet();
      if (checkSheet) {
        throw new HttpException(
          '기존 checkSheet가 존재합니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const parsedCheckSheetInfo = JSON.parse(checkSheetInfo);
      const parsedCheckLists = JSON.parse(checkLists);

      // 이미지 URL 생성
      const imageUrls = files.map((file) => ({ image_url: file.path }));

      // 검증 로직
      if (imageUrls.length > 4) {
        throw new HttpException(
          '안전 점검표 이미지는 최대 4장까지 업로드 가능합니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const checkSheetDto = {
        checkSheetInfo: parsedCheckSheetInfo,
        checkLists: parsedCheckLists,
        imageUrls,
      };
      const CreatedCheckSheet =
        await this.checkSheetRepository.createCheckSheet({
          ...checkSheetDto,
        });
      return CreatedCheckSheet;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async updateCheckSheet(
    checkSheetInfo: string,
    checkLists: string,
    images: string,
    files: Express.Multer.File[],
  ): Promise<any> {
    try {
      const parsedCheckSheetInfo = JSON.parse(checkSheetInfo);
      const parsedCheckLists = JSON.parse(checkLists);
      const parsedImages = images ? JSON.parse(images) : [];

      // 이미지 URL 생성
      const imageUrls = files.map((file) => ({ image_url: file.path }));

      const checkSheetDto = {
        checkSheetInfo: parsedCheckSheetInfo,
        checkLists: parsedCheckLists,
        imageUrls,
      };

      if (parsedImages?.length > 0) {
        checkSheetDto.imageUrls = [...parsedImages, ...imageUrls];
      }

      if (checkSheetDto.imageUrls.length > 4) {
        throw new HttpException(
          '안전 점검표 이미지는 최대 4장까지 업로드 가능합니다.',
          HttpStatus.BAD_REQUEST,
        );
      }
      const checkSheet = await this.checkSheetRepository.createCheckSheet({
        ...checkSheetDto,
      });

      const date = new Date();
      const today = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

      if (today !== checkSheet?.todayCheckedList?.date)
        checkSheet.todayCheckedList = null;

      return checkSheet;
    } catch (error) {
      console.error(error);
      ErrorHelper.handleError(error);
    }
  }

  async createCheckedList(createCheckedListDto: CheckedListDto) {
    try {
      return await this.checkSheetRepository.createCheckedList(
        createCheckedListDto,
      );
    } catch (error) {
      console.error(error);

      if (error instanceof DuplicateDateError) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      if (error instanceof ResourceNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findCheckedLists() {
    try {
      const checkedLists = await this.checkSheetRepository.findCheckedLists();

      if (!checkedLists.checkedLists || checkedLists.checkedLists.length === 0)
        throw new ResourceNotFoundError(
          'CheckedLists 데이터가 존재하지 않습니다.',
        );

      return checkedLists.checkedLists;
    } catch (error) {
      if (error instanceof ResourceNotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findCheckedList(date: string) {
    try {
      const dateDto = new DateDto();
      dateDto.date = date;

      const errors = validateSync(dateDto); // class-validator의 validateSync를 사용
      if (errors.length > 0) {
        const customMessage =
          errors
            .map((err) =>
              err.constraints
                ? Object.values(err.constraints).join(', ')
                : 'Invalid value',
            )
            .join(', ') || '날짜 형식은 YYYY-MM-DD이어야 합니다.';
        throw new HttpException(customMessage, HttpStatus.BAD_REQUEST);
      }

      const findList = await this.checkSheetRepository.findCheckedList(date);

      if (!findList) {
        throw new ResourceNotFoundError(
          '해당 날짜의 CheckedLists 데이터가 존재하지 않습니다.',
        );
      }

      return findList;
    } catch (error) {
      console.error(error.message);
      if (
        error instanceof ResourceNotFoundError ||
        error.name === 'ResourceNotFoundError'
      ) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      // HttpException이 이미 발생했으면 그대로 다시 throw
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateCheckedList(_id: string, checkedListDto: CheckedListDto) {
    try {
      return await this.checkSheetRepository.updateCheckedList(
        _id,
        checkedListDto,
      );
    } catch (error) {
      console.error(error.message, error);
      if (
        error instanceof ResourceNotFoundError ||
        error.name === 'ResourceNotFoundError'
      ) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      if (error instanceof mongoose.Error.CastError && error.path === '_id') {
        throw new HttpException(
          '잘못된 ID 형식입니다. 유효한 ObjectId를 제공해주세요.',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async removeCheckedLists() {
    try {
      return await this.checkSheetRepository.removeCheckedLists();
    } catch (error) {
      console.error(error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async removeCheckedList(_id: string) {
    try {
      return await this.checkSheetRepository.removeCheckedList(_id);
    } catch (error) {
      console.error(error.message);
      if (
        error instanceof ResourceNotFoundError ||
        error.name === 'ResourceNotFoundError'
      ) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      if (error instanceof mongoose.Error.CastError && error.path === '_id') {
        throw new HttpException(
          '잘못된 ID 형식입니다. 유효한 ObjectId를 제공해주세요.',
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
