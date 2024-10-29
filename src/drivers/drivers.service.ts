import { Injectable } from '@nestjs/common';
import { driversMongoRepository } from './drivers.repository';
import { getBase64Image } from 'src/lib/getBase64Image';
import { DriversImage } from './drviers.schema';

@Injectable()
export class DriversService {
  constructor(private driversRepository: driversMongoRepository) {}

  async updateDriver(
    files: Express.Multer.File[],
    originDriversPath: string[],
  ) {
    const driverUrls = files
      .filter((file) => file.fieldname === 'newDriversFiles')
      .map((file) => ({
        image_url: file.path,
        name: file.path.split('\\')[1].split('.')[0],
      }));

    // console.log(driverUrls, 'urls', originDriversPath, 'origin');
    const existingDriversImage = originDriversPath?.map((image) => ({
      image_url: image,
      name: image.split('\\')[1].split('.')[0],
    }));

    const combinedDrivers = [...driverUrls, ...(existingDriversImage || [])];

    return await this.driversRepository.updateDriver(combinedDrivers);
  }

  async getDriverImages() {
    try {
      const driverImages = await this.driversRepository.getDriverImages();
      const driverImagesToBase64: DriversImage[] = await Promise.all(
        driverImages.driversImage.map(async (image) => {
          const base64Image = await getBase64Image(image.image_url, image.name);
          return {
            base64: base64Image?.base64 || '',
            image_url: base64Image?.image_url || '',
            name: base64Image?.name || '',
          } as DriversImage;
        }),
      );

      return driverImagesToBase64;
    } catch (error) {
      console.error('Error driversService', error);
    }
  }
}
