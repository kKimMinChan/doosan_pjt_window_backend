import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MulterConfig } from 'multer.config';
import { WorkPlanService } from './work-plan.service';
import * as ExcelJS from 'exceljs';

@Controller('work-plan')
export class WorkPlanController {
  constructor(private workPlanService: WorkPlanService) {}

  @Get()
  async getWorkPlan() {
    try {
      const workPlan = await this.workPlanService.getWorkPlan();
      if (!workPlan) {
        // 데이터가 없는 경우 404 상태와 메시지 반환
        throw new HttpException(
          '작업 계획서 데이터가 없습니다. 작업 계획서를 추가해주세요.',
          HttpStatus.NOT_FOUND,
        );
      }
      return workPlan;
    } catch (error) {
      console.error(error.message);
      throw new HttpException(
        error.response ||
          '작업 계획서 데이터를 가져오는 중 문제가 발생했습니다.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('createWorkPlan')
  @UseInterceptors(FileInterceptor('workPlanFile', MulterConfig))
  async CreateWorkPlan(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response,
  ) {
    const createWorkPlan = this.workPlanService.createWorkPlan(file);
    return response.status(201).json(createWorkPlan);
  }

  // 운전자 명단이 변경되었을때
  @Post('updatedDriver')
  async updatedDriver(
    @Body('originWorkPlanPath') originWorkPlanPath: string,
    @Res() response: Response,
  ) {
    try {
      console.log(originWorkPlanPath, 'cont');
      const updatedDriver = await this.workPlanService.updatedDriver(
        originWorkPlanPath,
      );
      return response.status(201).json(updatedDriver);
    } catch (error) {
      console.error('Error fetching WorkPlan', error);
    }
  }

  @Post('newWeekWorkPlan')
  async newWeekWorkPlan(
    @Body('originWorkPlanPath') originWorkPlanPath: string,
    @Res() response: Response,
  ) {
    try {
      console.log(originWorkPlanPath, 'cont');
      const newWorkPlan = await this.workPlanService.newWeekWorkPlan(
        originWorkPlanPath,
      );
      return response.status(201).json(newWorkPlan);
    } catch (error) {
      console.error('Error fetching WorkPlan', error);
    }
  }

  // @Post('remake')

  @Post('signature')
  @UseInterceptors(FileInterceptor('file', MulterConfig))
  async signatureImage(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response,
    @Body('type') type: string,
    @Body('name') name: string,
  ) {
    if (name) {
      const signature = await this.workPlanService.signature(
        file.path,
        type,
        name,
      );
      // console.log(JSON.stringify(signature, null, 2));
      return response.status(201).json(signature);
    }
    const signature = await this.workPlanService.signature(file.path, type);
    console.log(JSON.stringify(signature, null, 2));
    return response.status(201).json(signature);
  }

  @Get('workPlanToExcel')
  async workPlanToExcel(@Res() res: Response) {
    try {
      const workPlanList = await this.workPlanService.getWorkPlanList();
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
        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=workplan_with_images.xlsx',
        );
        res.status(HttpStatus.OK).send(buffer);
      } else {
        throw new HttpException(
          '작업 계획서 데이터가 없습니다. 작업 계획서를 추가해주세요.',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      console.error(error.message);
      throw new HttpException(
        error.response ||
          '작업 계획서 데이터를 가져오는 중 문제가 발생했습니다.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
