import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MulterConfig } from 'multer.config';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
  constructor(private driversService: DriversService) {}
  @Get()
  async GetDriverImages() {
    try {
      const driversImage = await this.driversService.getDriverImages();
      return driversImage;
    } catch (error) {
      console.log('Error fetching DriverImages', error);
    }
  }

  @Post('updateDriver')
  @UseInterceptors(AnyFilesInterceptor(MulterConfig))
  async DriverImage(
    @UploadedFiles() files: Express.Multer.File[],
    @Res() response: Response,
    @Body('originDriversPath') originDriversPath: string[],
  ) {
    try {
      const updateDriver = await this.driversService.updateDriver(
        files,
        originDriversPath,
      );
      return response.status(201).json(updateDriver);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return response.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
