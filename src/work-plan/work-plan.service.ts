import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { WorkPlanMongoRepository } from './work-plan.repository';
import { DriverSignature, WorkPlanItem } from './work-plan.schema';
import { DriversService } from 'src/drivers/drivers.service';
import { DriversImage } from 'src/drivers/drviers.schema';
import { Image } from 'src/common_schema/Image.schema';
import { getBase64Image } from 'src/lib/getBase64Image';
import * as ExcelJS from 'exceljs';

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

  async workPlanToExcel() {
    const workPlanList = await this.getWorkPlanList();
    if (Array.isArray(workPlanList)) {
      // 열 이름을 생성하는 함수
      const getColumnLetter = (colIndex: number): string => {
        let letter = '';
        while (colIndex >= 0) {
          letter = String.fromCharCode((colIndex % 26) + 65) + letter;
          colIndex = Math.floor(colIndex / 26) - 1;
        }
        return letter;
      };

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('WorkPlan');

      // 이미지 추가 함수
      const addImageToWorksheet = (base64: string, cell: string) => {
        const imageId = workbook.addImage({
          base64: base64,
          extension: 'png',
        });
        worksheet.addImage(imageId, cell);
      };

      // workPlanList.forEach((workPlanData) => {

      let startingRow = 1; // 각 workPlanData의 시작 행을 동적으로 설정

      workPlanList.forEach((workPlanData) => {
        // 기본 데이터 추가
        worksheet.addRow([
          '생성일',
          workPlanData.createdAt
            ? workPlanData.createdAt.toLocaleDateString()
            : '',
        ]);
        worksheet.getCell(`A${startingRow}`).value = '생성일';
        worksheet.getCell(`B${startingRow}`).value = workPlanData.createdAt
          ? workPlanData.createdAt.toLocaleDateString()
          : '';
        startingRow += 2;

        worksheet.addRow([
          '작업계획서',
          '',
          '',
          '기안 서명',
          '',
          '',
          '결재 서명',
          '',
          '',
          '승인 서명',
        ]);

        // 이미지가 추가될 행 설정
        const imageRow = startingRow + 1;

        // Work Plan Image
        if (workPlanData.workPlanImage?.base64) {
          addImageToWorksheet(
            workPlanData.workPlanImage.base64,
            `A${imageRow}:B${imageRow + 7}`,
          );
        }

        // Signature Images
        if (workPlanData.signature?.draft?.base64) {
          addImageToWorksheet(
            workPlanData.signature.draft.base64,
            `D${imageRow}:E${imageRow + 7}`,
          );
        }
        if (workPlanData.signature?.authorization?.base64) {
          addImageToWorksheet(
            workPlanData.signature.authorization.base64,
            `G${imageRow}:H${imageRow + 7}`,
          );
        }
        if (workPlanData.signature?.approval?.base64) {
          addImageToWorksheet(
            workPlanData.signature.approval.base64,
            `J${imageRow}:K${imageRow + 7}`,
          );
        }

        // 운전자 서명 이미지와 이름 설정 (가로로 나열)
        workPlanData.signature?.driver.forEach((driver, index) => {
          const colIndex = index * 2;
          const startCol = getColumnLetter(colIndex);
          const endCol = getColumnLetter(colIndex + 1);
          const cellAddress = `${startCol}${imageRow + 10}:${endCol}${
            imageRow + 16
          }`; // 이미지 위치 조정

          if (driver.signatureImage?.base64) {
            addImageToWorksheet(driver.signatureImage.base64, cellAddress);
          }
          // 운전자 이름을 해당 열의 위에 추가
          worksheet.getCell(
            `${startCol}${imageRow + 9}`,
          ).value = `${driver.name}`;
        });

        // 각 workPlanData 항목 사이에 충분한 공백을 추가하기 위해 시작 행을 조정합니다.
        startingRow += 20; // 다음 workPlanData의 시작 행 위치 설정
      });

      // 엑셀 파일을 Buffer로 생성하여 응답으로 보내기
      return await workbook.xlsx.writeBuffer();
    } else {
      throw new HttpException(
        '작업 계획서 데이터가 없습니다. 작업 계획서를 추가해주세요.',
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
