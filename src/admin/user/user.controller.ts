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
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MulterConfig } from 'multer.config';
import { UpdateUserRequest, UserRequest } from './dto/request.dto';
import { UserResponse } from './dto/response.dto';

@ApiTags('[관리자] 사용자 관리')
@Controller('admin')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UseInterceptors(FileInterceptor('file', MulterConfig))
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    type: UserResponse,
  })
  async createUser(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UserRequest,
  ) {
    return await this.userService.createUser(body, file);
  }

  @Get('users')
  @ApiResponse({
    type: [UserResponse],
  })
  async findAll() {
    const users = await this.userService.findAll();
    console.log(users);
    return users;
  }

  @Get('users/:id')
  @ApiParam({
    name: 'id', // 경로 파라미터 이름
    description: 'User ID', // 설명
    required: true, // 필수 여부
  })
  @ApiResponse({
    type: UserResponse,
  })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put('users/:id')
  @UseInterceptors(FileInterceptor('file', MulterConfig))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UserRequest,
  })
  @ApiResponse({
    type: UserResponse,
  })
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UserRequest,
  ) {
    return await this.userService.update(id, body, file);
  }

  @Delete('users/:id')
  async remove(@Param('id') id: string) {
    return await this.userService.remove(id);
  }
}
