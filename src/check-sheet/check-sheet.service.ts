import { Injectable } from '@nestjs/common';
import { CheckSheetMongoRepository } from './check-sheet.repository';
import { CheckedList } from './check-sheet.schema';
import * as fs from 'fs';
import { promisify } from 'util';

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
          const imageUrls = checkSheetData?.image?.map((image, index) =>
            image.image_url.replace(/^"|"$/g, ''),
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

        // const plainObject = checkSheetData.toObject
        //   ? checkSheetData.toObject()
        //   : checkSheetData;

        // return plainObject;
        return checkSheetData;
      }
      return null;
    } catch (error) {
      console.error('Error loading or encoding file:', error);
      throw new Error('Failed to encode image to Base64');
    }
  }

  async createCheckSheet(
    checkSheetInfo: string,
    checkLists: string,
    files: Express.Multer.File[],
  ): Promise<any> {
    const parsedCheckSheetInfo = JSON.parse(checkSheetInfo);
    const parsedCheckLists = JSON.parse(checkLists);

    // 이미지 URL 생성
    const imageUrls = files.map((file) => ({ image_url: file.path }));

    // 검증 로직
    if (imageUrls.length > 4) {
      throw new Error('안전 점검표 이미지는 최대 4장까지 업로드 가능합니다.');
    }

    const checkSheetDto = {
      checkSheetInfo: parsedCheckSheetInfo,
      checkLists: parsedCheckLists,
      image: imageUrls,
    };

    try {
      const checkSheet = await this.checkSheetRepository.createCheckSheet({
        ...checkSheetDto,
      });
      return checkSheet;
    } catch (error) {
      throw new Error(`Service Error: ${error.message}`);
    }
  }

  async updateCheckSheet(
    checkSheetInfo: string,
    checkLists: string,
    images: string,
    files: Express.Multer.File[],
  ): Promise<any> {
    const parsedCheckSheetInfo = JSON.parse(checkSheetInfo);
    const parsedCheckLists = JSON.parse(checkLists);
    const parsedImages = images ? JSON.parse(images) : [];

    // 이미지 URL 생성
    const imageUrls = files.map((file) => ({ image_url: file.path }));

    const checkSheetDto = {
      checkSheetInfo: parsedCheckSheetInfo,
      checkLists: parsedCheckLists,
      image: imageUrls,
    };

    if (parsedImages?.length > 0) {
      checkSheetDto.image = [...parsedImages, ...imageUrls];
    }

    if (checkSheetDto.image.length > 4) {
      throw new Error('안전 점검표 이미지는 최대 4장까지 업로드 가능합니다.');
    }

    try {
      const checkSheet = await this.checkSheetRepository.createCheckSheet({
        ...checkSheetDto,
      });
      return checkSheet;
    } catch (error) {
      throw new Error(`Service Error: ${error.message}`);
    }
  }

  async recordSheet(checkItemDto: CheckedList) {
    return await this.checkSheetRepository.recordSheet(checkItemDto);
  }

  async updateSheet(checkItemDto: CheckedList) {
    return await this.checkSheetRepository.updateSheet(checkItemDto);
  }

  // async login(password: string) {
  //   const checkSheetData = await this.checkSheetRepository.getCheckSheet();
  //   if (checkSheetData.password) {
  //     if (bcrypt.compareSync(password, checkSheetData.password)) {
  //       return checkSheetData;
  //     } else return false;
  //   }
  //   return null;
  // }
}
