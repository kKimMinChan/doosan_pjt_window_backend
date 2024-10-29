import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  Res,
  Response as resp,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CheckSheetService } from './check_sheet.service';
import { Response } from 'express';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { MulterConfig } from 'multer.config';
import {
  CheckList,
  CheckSheetInfo,
  CheckedList,
  // DriversImage,
} from './check_sheet.schema';
import { LocalAuthGuard } from './check_sheet.guard';

@Controller('check-sheet')
export class CheckSheetController {
  constructor(private checkSheetService: CheckSheetService) {}
  @Get()
  async getCheckSheet() {
    try {
      const checkSheet = await this.checkSheetService.getCheckSheet();

      return checkSheet;
    } catch (error) {
      console.error('Error fetching CheckSheet', error);
    }
  }

  @Post('create')
  @UseInterceptors(AnyFilesInterceptor(MulterConfig))
  async createPost(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('checkSheetInfo') checkSheetInfo: string,
    @Body('checkLists') checkLists: string,
    @Body('originWorkSafetyCheckListPath') images: string[],
    @Body('originDriversPath') originDriversPath: string[],
    @Body('password') password: string,
    @Res() response: Response,
  ) {
    try {
      const checkSheetData = await this.checkSheetService.getCheckSheet();

      const parsedCheckSheetInfo = JSON.parse(checkSheetInfo) as CheckSheetInfo;
      const parsedCheckLists = JSON.parse(checkLists) as CheckList[];

      const imageUrls = files
        .filter((file) => file.fieldname === 'newWorkSafetyCheckListFiles')
        .map((file) => ({ image_url: file.path }));

      const checkSheetDto = {
        checkSheetInfo: parsedCheckSheetInfo,
        checkLists: parsedCheckLists,
        image: imageUrls,
        checkedList: [],
        password,
      };

      if (images?.length > 0) {
        checkSheetDto.image = [
          ...images.map((imgUrl) => ({
            image_url: imgUrl,
          })),
          ...imageUrls,
        ];
      }

      if (!checkSheetDto) {
        return response.status(400).json({ message: 'Bad Request' });
      }

      const createdCheckSheet = await this.checkSheetService.createCheckSheet(
        checkSheetDto,
      );
      // return response.status(401).json({ message: 'error' });
      return response.status(201).json(createdCheckSheet);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return response.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @resp() res) {
    console.log(res.cookies, 'cookies');
    return res.json(req.user);
  }

  // @UseGuards(AuthenticatedGuard)
  // @Get('check')
  // testGuardWithSession(@Request() req, @resp() res) {
  //   return res.json(req.user);
  // }

  @Get('check')
  getProtected(@Request() req) {
    if (req.isAuthenticated()) {
      return { message: 'Access granted', user: req.user };
    } else {
      return { message: 'Access denied' };
    }
  }

  @Post('record')
  async recordSheet(@Body() body, @Res() response: Response) {
    try {
      const checkItemDto: CheckedList = body;
      const record = await this.checkSheetService.recordSheet(checkItemDto);
      console.log(record, 'cont');
      return response.status(201).json(record);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return response.status(500).json({ message: 'Internal Server Error' });
    }
  }

  @Put('updateSheet')
  async updateSheet(@Body() body, @Res() response: Response) {
    try {
      const checkItemDto: CheckedList = body;
      const record = await this.checkSheetService.updateSheet(checkItemDto);
      return response.status(201).json(record);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return response.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // @Post('signature')
  // @UseInterceptors(FileInterceptor('file', MulterConfig))
  // async signatureImage(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Res() response: Response,
  //   @Body('type') type: string,
  //   @Body('name') name: string,
  // ) {
  //   if (name) {
  //     const signature = await this.checkSheetService.signature(
  //       file.path,
  //       type,
  //       name,
  //     );
  //     console.log(JSON.stringify(signature, null, 2));
  //     return response.status(201).json(signature);
  //   }
  //   const signature = await this.checkSheetService.signature(file.path, type);
  //   console.log(JSON.stringify(signature, null, 2));
  //   return response.status(201).json(signature);
  // }
}
