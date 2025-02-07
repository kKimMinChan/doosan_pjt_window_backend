import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Put,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MulterConfig } from 'multer.config';
import { UpdateUserRequest, UserRequest } from './dto/request.dto';
import { UserResponse } from './dto/response.dto';
import { SwaggerHelper } from 'src/helper/SwaggerHelper';
import { PaginationDto } from 'src/common-dto/pagination.dto';

@ApiTags('[관리자] 사용자 관리')
@Controller('admin')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UseInterceptors(FileInterceptor('file', MulterConfig))
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema(null, '사용자 생성'))
  async createUser(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UserRequest,
  ) {
    console.log(body, 'users');
    await this.userService.createUser(body, file);
    return {
      translate: '요청이 성공적으로 처리되었습니다.',
    };
  }

  @Get('users')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(UserResponse, '', true),
  )
  @ApiResponse({ type: UserResponse })
  async findAll(@Query() paginationDto: PaginationDto) {
    const users = await this.userService.findAll(paginationDto);
    return users;
  }

  @Get('users/:id')
  @ApiParam({
    name: 'id', // 경로 파라미터 이름
    description: 'User ID', // 설명
    required: true, // 필수 여부
  })
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema(UserResponse, ''))
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return { data: [user] };
  }

  @Put('users/:id')
  @UsePipes(new ValidationPipe({ transform: true })) // 문자열을 boolean으로 변환
  @UseInterceptors(FileInterceptor('file', MulterConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateUserRequest,
  })
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UpdateUserRequest,
  ) {
    await this.userService.update(id, body, file);
    return {
      translate: '요청이 성공적으로 처리되었습니다.',
    };
  }

  @Delete('users/:id')
  @ApiCreatedResponse(SwaggerHelper.getApiResponseSchema())
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    return {
      translate: '요청이 성공적으로 처리되었습니다.',
    };
  }
}
