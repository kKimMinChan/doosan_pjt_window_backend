import { Injectable } from '@nestjs/common';
import { Drivers, DriversDocument, DriversImage } from './drviers.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface DriversRepository {
  updateDriver(driversImageDto: DriversImage[]);
  getDriverImages();
}

@Injectable()
export class driversMongoRepository implements DriversRepository {
  constructor(
    @InjectModel(Drivers.name)
    private driversModel: Model<DriversDocument>,
  ) {}

  async getDriverImages() {
    try {
      const driverImages = await this.driversModel.findOne();
      return driverImages;
    } catch (error) {
      console.error('Error fetching driverImages:', error);
      throw error;
    }
  }

  async updateDriver(driversImageDto: DriversImage[]) {
    const drivers = await this.driversModel.findOne();
    if (drivers) {
      drivers.driversImage = driversImageDto;
      return drivers.save(); // 변경사항을 데이터베이스에 저장
    } else {
      const drivers = {
        driversImage: [...driversImageDto],
      };
      const createDrivers = new this.driversModel({ ...drivers });
      return await createDrivers.save();
    }
  }
}
