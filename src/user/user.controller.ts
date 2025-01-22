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
import { ApiBody, ApiConsumes, ApiParam, ApiResponse } from '@nestjs/swagger';
import { MulterConfig } from 'multer.config';
import { UserRequest } from './dto/request.dto';
import { UserResponse } from './dto/response.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user')
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

  @Get()
  @ApiResponse({
    type: [UserResponse],
  })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
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

  @Put(':id')
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

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.userService.remove(id);
  }
}
