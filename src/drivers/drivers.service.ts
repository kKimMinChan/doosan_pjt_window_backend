import { Injectable } from '@nestjs/common';
import { driversMongoRepository } from './drivers.repository';
import { getBase64Image } from 'src/lib/getBase64Image';
import { DriversImage } from './drviers.schema';
import * as path from 'path';
@Injectable()
export class DriversService {
  constructor(private driversRepository: driversMongoRepository) {}

  async createDriver(files: Express.Multer.File[]) {
    const driverUrls = files.map((file) => {
      const filePath = file.path;
      const fileName = path.parse(filePath).name;
      return {
        image_url: filePath,
        name: fileName,
      };
    });

    return await this.driversRepository.updateDriver(driverUrls);
  }

  async updateDriver(files: Express.Multer.File[], originDriverPaths: string) {
    const parsedOriginDriverPaths = JSON.parse(originDriverPaths);

    const driverUrls = files.map((file) => {
      const filePath = file.path;
      const fileName = path.parse(filePath).name;
      return {
        image_url: filePath,
        name: fileName,
      };
    });

    console.log(parsedOriginDriverPaths);

    const existingDriversImage = parsedOriginDriverPaths?.map((image) => {
      console.log(image);

      const fileName = path.parse(image.image_url).name;
      return {
        image_url: image.image_url,
        name: fileName,
      };
    });

    const combinedDrivers = [...driverUrls, ...(existingDriversImage || [])];

    return await this.driversRepository.updateDriver(combinedDrivers);
  }

  async getDriverImages() {
    try {
      const driverImages = await this.driversRepository.getDriverImages();
      if (driverImages !== null) {
        const driverImagesToBase64: DriversImage[] = await Promise.all(
          driverImages.driversImage.map(async (image) => {
            const base64Image = await getBase64Image(
              image.image_url,
              image.name,
            );
            return {
              base64: base64Image?.base64 || '',
              image_url: base64Image?.image_url || '',
              name: base64Image?.name || '',
            } as DriversImage;
          }),
        );
        return driverImagesToBase64;
      }
      return null;
    } catch (error) {
      console.error('Error driversService', error);
    }
  }
}
