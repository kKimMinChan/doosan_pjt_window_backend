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
  CheckSheetPaginationDto,
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
import { CheckSheetResponse, IssueResponse } from './dto/check-sheet.response';
import { ObjectIdValidationPipe } from 'src/pipes/objectid-validation.pipe';

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
    console.log(body);
    return await this.checkSheetService.create(body, files);
  }

  @Get(':id')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(CheckSheetResponse, '', false, true),
  )
  @ApiResponse({ type: CheckSheetResponse })
  async findOne(@Param('id', ObjectIdValidationPipe) id: string) {
    const checkSheet = await this.checkSheetService.findOne(id);
    return {
      data: checkSheet,
    };
  }
  @Get(':equipmentId/latest-issue')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(IssueResponse, '', false, true),
  )
  @ApiResponse({ type: IssueResponse })
  async findOneLatestIssue(
    @Param('equipmentId', ObjectIdValidationPipe) id: string,
  ) {
    const checkSheet = await this.checkSheetService.findOneLatestIssue(id);
    return {
      data: checkSheet,
    };
  }

  @Get(':equipmentId/latest')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(CheckSheetResponse, '', false, true),
  )
  async findOneLatest(
    @Param('equipmentId', ObjectIdValidationPipe) id: string,
  ) {
    const checkSheet = await this.checkSheetService.findOneLatest(id);
    return {
      data: checkSheet,
    };
  }

  @Get('/equipment/:id')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(CheckSheetResponse, '', true, true),
  )
  async findAll(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Query() checkSheetPaginationDto: CheckSheetPaginationDto,
  ) {
    return await this.checkSheetService.findAll(id, checkSheetPaginationDto);
  }

  @Put(':id')
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateCheckSheetRequest })
  async update(
    @Param('id', ObjectIdValidationPipe) id: string,
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
  async remove(@Param('id', ObjectIdValidationPipe) id: string) {
    console.log(id);
    return await this.checkSheetService.remove(id);
  }

  @Delete()
  async removeAll() {
    return await this.checkSheetService.removeAll();
  }
}
