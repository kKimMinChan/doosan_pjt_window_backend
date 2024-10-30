import { Injectable } from '@nestjs/common';
import { WorkPlanMongoRepository } from './work-plan.repository';
import { DriverSignature, WorkPlanItem } from './work-plan.schema';
import { DriversService } from 'src/drivers/drivers.service';
import { DriversImage } from 'src/drivers/drviers.schema';
import { Image } from 'src/common_schema/Image.schema';
import { getBase64Image } from 'src/lib/getBase64Image';

@Injectable()
export class WorkPlanService {
  constructor(
    private workPlanRepository: WorkPlanMongoRepository,
    private driversService: DriversService,
  ) {}

  async getWorkPlanList() {
    const workPlanList = await this.workPlanRepository.getWorkPlan();

    if (workPlanList) {
      const workPlanListToBase64 = await Promise.all(
        workPlanList.workPlanList.map(async (workPlan) => {
          workPlan.workPlanImage = await getBase64Image(
            workPlan.workPlanImage?.image_url,
          );
          workPlan.signature.approval = await getBase64Image(
            workPlan.signature.approval?.image_url,
          );
          workPlan.signature.draft = await getBase64Image(
            workPlan.signature.draft?.image_url,
          );
          workPlan.signature.authorization = await getBase64Image(
            workPlan.signature.authorization?.image_url,
          );

          workPlan.signature.driver = await Promise.all(
            workPlan.signature.driver.map(async (driver) => {
              if (driver.signatureImage?.image_url) {
                driver.signatureImage = await getBase64Image(
                  driver.signatureImage.image_url,
                );
              }
              return driver;
            }),
          );

          return workPlan;
        }),
      );

      return workPlanListToBase64;
    }
    return workPlanList;
  }

  async getWorkPlan() {
    const workPlanList = await this.workPlanRepository.getWorkPlan();
    if (workPlanList !== null) {
      const workPlan = workPlanList.workPlanList.pop();
      workPlan.workPlanImage = await getBase64Image(
        workPlan.workPlanImage?.image_url,
      );
      workPlan.signature.approval = await getBase64Image(
        workPlan.signature.approval?.image_url,
      );
      workPlan.signature.draft = await getBase64Image(
        workPlan.signature.draft?.image_url,
      );
      workPlan.signature.authorization = await getBase64Image(
        workPlan.signature.authorization?.image_url,
      );

      workPlan.signature.driver = await Promise.all(
        workPlan.signature.driver.map(async (driver) => {
          if (driver.signatureImage?.image_url) {
            driver.signatureImage = await getBase64Image(
              driver.signatureImage.image_url,
            );
          }
          return driver;
        }),
      );

      return workPlan;
    }
    return null;
  }

  async newWeekWorkPlan(originWorkPlanPath: string) {
    const driverImages = await this.getDriverImages();
    if (driverImages) {
      const driverNames = driverImages.map(
        (image: DriversImage): DriverSignature => ({
          name: image.name,
        }),
      );

      const workPlanImage: Image = {
        image_url: originWorkPlanPath,
      };

      const workPlanItem: WorkPlanItem = {
        workPlanImage: workPlanImage,
        signature: {
          driver: driverNames,
        },
      };
      const workPlan = await this.workPlanRepository.createWorkPlan(
        workPlanItem,
      );
      return workPlan;
    }
  }

  async updatedDriver(originWorkPlanPath: string) {
    const driverImages = await this.getDriverImages();
    const driverNames = driverImages.map(
      (image: DriversImage): DriverSignature => ({
        name: image.name,
      }),
    );
    const workPlanDocument = await this.workPlanRepository.getWorkPlan();
    const originWorkPlan = workPlanDocument.workPlanList.pop();

    const updatedDriversSignature = driverNames.map((driver) => {
      // 기존의 일치하는 driver를 찾습니다.
      const matchedSignature = originWorkPlan.signature.driver.find(
        (originSignature) => driver.name === originSignature.name,
      );

      // 일치하는 것이 있으면 그대로 반환하고, 없으면 name만 포함된 객체 반환
      if (matchedSignature) {
        return matchedSignature;
      } else {
        return { name: driver.name }; // 일치하는 것이 없을 때 name만 포함
      }
    });

    const workPlanImage: Image = {
      image_url: originWorkPlanPath,
    };

    const workPlanItem: WorkPlanItem = {
      ...originWorkPlan,
      workPlanImage: workPlanImage,
      signature: {
        ...originWorkPlan.signature, // 기존의 signature를 유지하고
        driver: updatedDriversSignature, // driver 부분만 업데이트
      },
    };

    const workPlan = await this.workPlanRepository.updatedDriver(workPlanItem);
    return workPlan;
  }

  async createWorkPlan(workPlanFile: Express.Multer.File) {
    const driverImages = await this.getDriverImages();
    const driverNames = driverImages.map(
      (image: DriversImage): DriverSignature => ({
        name: image.name,
      }),
    );

    const workPlanImage: Image = {
      image_url: workPlanFile.path,
    };

    const workPlanItem: WorkPlanItem = {
      workPlanImage: workPlanImage,
      signature: {
        driver: driverNames,
      },
    };
    const workPlan = await this.workPlanRepository.createWorkPlan(workPlanItem);
    return workPlan;
  }

  async getDriverImages() {
    return await this.driversService.getDriverImages();
  }

  async signature(signatureUrl: string, signatureType: string, name?: string) {
    return await this.workPlanRepository.signature(
      signatureUrl,
      signatureType,
      name,
    );
  }
}
