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

@ApiTags('[관리자] 사용자 관리')
@Controller('admin')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UseInterceptors(FileInterceptor('file', MulterConfig))
  @ApiConsumes('multipart/form-data')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(UserResponse, '사용자 생성', 'users'),
  )
  async createUser(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UserRequest,
  ) {
    const users = await this.userService.createUser(body, file);
    return {
      users,
      translate: '요청이 성공적으로 처리되었습니다.',
    };
  }

  @Get('users')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(UserResponse, '', 'users'),
  )
  async findAll() {
    const users = await this.userService.findAll();
    return { users };
  }

  @Get('users/:id')
  @ApiParam({
    name: 'id', // 경로 파라미터 이름
    description: 'User ID', // 설명
    required: true, // 필수 여부
  })
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(UserResponse, '', 'users'),
  )
  async findOne(@Param('id') id: string) {
    const users = await this.userService.findOne(id);
    return {
      users,
    };
  }

  @Put('users/:id')
  @UseInterceptors(FileInterceptor('file', MulterConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UserRequest,
  })
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(UserResponse, '', 'users'),
  )
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UserRequest,
  ) {
    const users = await this.userService.update(id, body, file);
    return { users };
  }

  @Delete('users/:id')
  @ApiCreatedResponse(
    SwaggerHelper.getApiResponseSchema(UserResponse, '', 'users'),
  )
  @ApiResponse({ type: UserResponse })
  async remove(@Param('id') id: string) {
    return await this.userService.remove(id);
  }
}
