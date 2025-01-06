import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MulterConfig } from 'multer.config';
import { DriversService } from './drivers.service';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';
import {
  CreateDriverImageInputDto,
  DriverImagesOutputDto,
  DriversDto,
  UpdateDriverImageInputDto,
} from './swagger.dto';

@Controller('drivers')
export class DriversController {
  constructor(private driversService: DriversService) {}
  @Get()
  @ApiOperation({
    summary: '운전자 목록 GET API',
    description: '운전자 목록',
  })
  @ApiCreatedResponse({
    description: '운전자 목록',
    type: DriversDto,
  })
  async GetDriverImages() {
    try {
      const driversImage = await this.driversService.getDriverImages();
      if (!driversImage) {
        // 데이터가 없는 경우 404 상태와 메시지 반환
        throw new HttpException(
          '운전자 사진 데이터가 없습니다. 운전자 사진을 추가해주세요.',
          HttpStatus.NOT_FOUND,
        );
      }

      return driversImage;
    } catch (error) {
      console.error(error.message);
      // 에러를 클라이언트로 재발생시켜 전송
      throw new HttpException(
        error.response ||
          '운전자 사진 데이터를 가져오는 중 문제가 발생했습니다.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  @ApiOperation({
    summary: '운전자 추가 API',
    description: '운전자 추가',
  })
  @ApiCreatedResponse({
    description: '운전자 추가',
    type: DriverImagesOutputDto,
  })
  @ApiBody({
    description: '운전자 추가',
    type: CreateDriverImageInputDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor(MulterConfig))
  async DriverImage(
    @UploadedFiles() files: Express.Multer.File[],
    @Res() response: Response,
  ) {
    try {
      const createDriver = await this.driversService.createDriver(files);
      return response.status(201).json(createDriver);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return response.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Put()
  @ApiOperation({
    summary: '운전자 수정 API',
    description: '운전자 수정',
  })
  @ApiBody({
    description: '운전자 수정',
    type: UpdateDriverImageInputDto,
  })
  @ApiCreatedResponse({
    description: '운전자 수정',
    type: DriverImagesOutputDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(AnyFilesInterceptor(MulterConfig))
  async updateDrivers(
    @UploadedFiles() files: Express.Multer.File[],
    @Res() response: Response,
    @Body('originDriverPaths') originDriverPaths: string,
  ) {
    try {
      console.log(originDriverPaths);
      const updatedDriver = await this.driversService.updateDriver(
        files,
        originDriverPaths,
      );
      return response.status(201).json(updatedDriver);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return response.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
