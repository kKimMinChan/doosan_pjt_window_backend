import { HttpException, Injectable } from '@nestjs/common';
import { CheckSheetMongoRepository } from './check_sheet.repository';
import {
  CheckSheet,
  CheckedList,
  // DriversImage
} from './check_sheet.schema';
import * as fs from 'fs';
import { promisify } from 'util';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

const readFile = promisify(fs.readFile);

@Injectable()
export class CheckSheetService {
  constructor(private checkSheetRepository: CheckSheetMongoRepository) {}

  async getBase64Image(imageUrl: string) {
    try {
      if (imageUrl !== null) {
        const imageBuffer = await readFile(imageUrl);
        return {
          base64: `data:image/png;base64,${imageBuffer.toString('base64')}`,
          image_url: imageUrl,
        };
      }
      // console.log(imageUrl, 'null');
      return;
    } catch (error) {
      console.error(`Error reading file at ${imageUrl}: ${error}`);
      return null;
    }
  }

  async getCheckSheet() {
    try {
      const checkSheetData = await this.checkSheetRepository.getCheckSheet();
      if (checkSheetData) {
        if (checkSheetData?.image.length > 0) {
          const imageUrls = checkSheetData?.image?.map(
            (image, index) => image.image_url,
          );

          // 모든 이미지 파일을 비동기적으로 읽고 Base64로 인코딩
          const imagesBase64 = await Promise.all(
            imageUrls.map(async (imagePath) => {
              const imageBuffer = await readFile(imagePath);
              return {
                base64: `data:image/png;base64,${imageBuffer.toString(
                  'base64',
                )}`,
                image_url: imagePath,
              };
            }),
          );

          // 이미지 데이터를 checkSheetData 객체에 저장하거나 반환
          checkSheetData.image = imagesBase64.map((base64, _) => base64);
        }

        const plainObject = checkSheetData.toObject
          ? checkSheetData.toObject()
          : checkSheetData;

        const { password, ...rest } = plainObject;
        return rest;
      }
      return null;
    } catch (error) {
      console.error('Error loading or encoding file:', error);
      throw new Error('Failed to encode image to Base64');
    }
  }

  async createCheckSheet(checkSheetDto: CheckSheet) {
    const encryptedPassword = bcrypt.hashSync(checkSheetDto.password, 10);
    try {
      const checkSheet = await this.checkSheetRepository.createCheckSheet({
        ...checkSheetDto,
        password: encryptedPassword,
      });
      checkSheet.password = undefined;
      return checkSheet;
    } catch (error) {
      throw new HttpException('서버 에러', 500);
    }
    // return await this.checkSheetRepository.createCheckSheet(checkSheetDto);
  }

  async recordSheet(checkItemDto: CheckedList) {
    return await this.checkSheetRepository.recordSheet(checkItemDto);
  }

  async updateSheet(checkItemDto: CheckedList) {
    return await this.checkSheetRepository.updateSheet(checkItemDto);
  }

  // async signature(signatureUrl: string, signatureType: string, name?: string) {
  //   return await this.checkSheetRepository.signature(
  //     signatureUrl,
  //     signatureType,
  //     name,
  //   );
  // }

  // async login(password: string) {
  //   const checkSheetData = await this.checkSheetRepository.getCheckSheet();
  //   if (checkSheetData.password) {
  //     if (bcrypt.compareSync(password, checkSheetData.password)) {
  //       return checkSheetData;
  //     } else return false;
  //   }
  //   return null;
  // }

  async login(password: string) {
    const checkSheetData = await this.checkSheetRepository.getCheckSheet();

    console.log(checkSheetData.password, password);
    if (checkSheetData.password) {
      Logger.log(`Stored password hash: ${checkSheetData.password}`, 'login');
      Logger.log(`Received password for comparison: ${password}`, 'login');

      const comparisonResult = bcrypt.compareSync(
        password,
        checkSheetData.password,
      );
      Logger.log(`Password comparison result: ${comparisonResult}`, 'login');

      if (comparisonResult) {
        return checkSheetData;
      } else {
        Logger.log(`Password mismatch. Access denied.`, 'login');
        return false;
      }
    } else {
      Logger.log(`No password set in the checkSheetData.`, 'login');
      return null;
    }
  }
}
