import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CheckSheet as SCheckSheet,
  CheckSheetDocument,
  CheckSheet,
  CheckItem,
  CheckedList,
  // DriversImage,
} from './check_sheet.schema';

export interface CheckSheetRepository {
  createCheckSheet(checkSheetDto: CheckSheet);
  recordSheet(checkItemDto: CheckedList);
  updateSheet(checkItemDto: CheckedList);
  // signature(signatureUrl: string, signatureType: string, name: string);
}

@Injectable()
export class CheckSheetMongoRepository implements CheckSheetRepository {
  constructor(
    @InjectModel(SCheckSheet.name)
    private checkSheetModel: Model<CheckSheetDocument>,
  ) {}

  async getCheckSheet() {
    try {
      const checkSheet = await this.checkSheetModel.findOne();
      return checkSheet;
    } catch (error) {
      console.error('Error fetching CheckSheet:', error);
      throw error;
    }
  }

  async createCheckSheet(checkSheetDto: CheckSheet) {
    const checkSheet = await this.checkSheetModel.findOne();
    if (checkSheet) {
      checkSheet.checkSheetInfo = checkSheetDto.checkSheetInfo;
      checkSheet.checkLists = checkSheetDto.checkLists;
      checkSheet.image = checkSheetDto.image;

      return await checkSheet.save();
    } else {
      const createCheckSheet = new this.checkSheetModel({ ...checkSheetDto });
      return await createCheckSheet.save();
    }
  }

  async updateSheet(checkItemDto: CheckedList) {
    try {
      const checkSheet = await this.checkSheetModel.findOne();
      if (!checkSheet) {
        console.log('CheckSheet not found');
        return null;
      }
      const index = checkSheet.checkedList.findIndex(
        (list) => list.date === checkItemDto.date,
      );

      if (index !== -1) {
        checkSheet.checkedList[index] = checkItemDto;
        await checkSheet.save(); // 변경사항을 데이터베이스에 저장
        console.log('체크시트 업데이트 성공');
        return checkSheet; // 업데이트된 체크시트 반환
      } else {
        console.log('날짜가 같은 체크시트가 없음, 새 데이터 추가 가능');
        return null;
      }
    } catch (error) {
      console.error('Error fetching checkItem: ', error);
      throw error;
    }
  }

  async recordSheet(checkItemDto: CheckedList) {
    try {
      const checkSheet = await this.checkSheetModel.findOne();
      if (!checkSheet) {
        console.log('CheckSheet not found');
        return null;
      }
      if (checkSheet.checkedList !== null) {
        const dateExists = checkSheet.checkedList.some(
          (list) => list.date === checkItemDto.date,
        );
        if (dateExists) {
          console.log('날짜가 같은 체크시트를 두 개 생성할 수 없음');
          return null;
        }
      }
      console.log(checkItemDto, 'dto');
      checkSheet.checkedList.push(checkItemDto);
      return await checkSheet.save();
    } catch (error) {
      console.error('Error fetching checkItem: ', error);
      throw error;
    }
  }

  // async signature(signatureUrl: string, signatureType: string, name: string) {
  //   try {
  //     const checkSheet = await this.checkSheetModel.findOne();
  //     if (!checkSheet) {
  //       console.log('CheckSheet not found');
  //       return null;
  //     }

  //     const len = checkSheet.workPlan.length;

  //     if (name) {
  //       const driverIdx = checkSheet.workPlan[
  //         len - 1
  //       ].signature.driver.findIndex((driver) => driver.name === name);

  //       // const newDrivers = checkSheet.workPlan[0].signature.driver;
  //       // newDrivers[driverIdx]
  //       checkSheet.workPlan[len - 1].signature.driver[
  //         driverIdx
  //       ].signatureImage.image_url = signatureUrl;
  //       checkSheet.markModified(
  //         `workPlan.0.signature.driver.${driverIdx}.signatureImage.image_url`,
  //       );
  //       console.log(checkSheet.workPlan[len - 1].signature.driver);
  //     } else {
  //       checkSheet.workPlan[len - 1].signature[signatureType] =
  //         checkSheet.workPlan[len - 1].signature[signatureType] || {};
  //       checkSheet.workPlan[len - 1].signature[signatureType].image_url =
  //         signatureUrl;
  //     }

  //     // checkSheet.workPlan[0].signature[signatureType].image_url = signatureUrl;
  //     checkSheet.markModified('workPlan');
  //     await checkSheet.save();
  //     return checkSheet;
  //   } catch (error) {
  //     console.error('Error fetching checkItem: ', error);
  //     throw error;
  //   }
  // }
}
