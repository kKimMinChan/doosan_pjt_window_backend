import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { CheckSheetService } from './check-sheet.service';
import {
  CheckSheetRequest,
  UpdateCheckSheetRequest,
} from './dto/check-sheet.request';
import { PaginationDto } from 'src/common-dto/pagination.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AnyFilesInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { SwaggerHelper } from 'src/helper/SwaggerHelper';
import { CheckSheetResponse } from './dto/check-sheet.response';

@ApiTags('안전 점검표')
@Controller('check-sheets')
export class CheckSheetController {
  constructor(private readonly checkSheetService: CheckSheetService) {}

  @Post()
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CheckSheetRequest })
  async create(
    @UploadedFiles() files: Express.MulterS3.File[],
    @Body() body: any,
  ) {
    return await this.checkSheetService.create(body, files);
  }

  @Get(':id')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(CheckSheetResponse, '', false, true),
  )
  @ApiResponse({ type: CheckSheetResponse })
  async findOne(@Param('id') id: string) {
    const checkSheet = await this.checkSheetService.findOne(id);
    return {
      data: checkSheet,
    };
  }

  @Get(':heavyEquipmentId/latest')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(CheckSheetResponse, '', false, true),
  )
  async findOneLatest(@Param('heavyEquipmentId') id: string) {
    const checkSheet = await this.checkSheetService.findOneLatest(id);
    return {
      data: checkSheet,
    };
  }

  @Get('/heavyEquipment/:id')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(CheckSheetResponse, '', true, true),
  )
  async findAll(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.checkSheetService.findAll(id, paginationDto);
  }

  @Put(':id')
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateCheckSheetRequest })
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.MulterS3.File[],
    @Body() body: any,
  ) {
    await this.checkSheetService.update(id, body, files);
    return {
      translate: '요청이 성공적으로 처리되었습니다.',
    };
  }

  @Delete(':id')
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  async remove(@Param('id') id: string) {
    return this.checkSheetService.remove(id);
  }
}
