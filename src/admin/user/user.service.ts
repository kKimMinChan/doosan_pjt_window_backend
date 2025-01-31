import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateUserRequest, UserRequest } from './dto/request.dto';
import { usersMongoRepository } from './user.repository';
import { UserInfo } from './entities/user.entity';
import { ErrorHelper } from 'src/helper/ErrorHelper';
import mongoose from 'mongoose';

@Injectable()
export class UserService {
  constructor(private usersRepository: usersMongoRepository) {}
  async createUser(userInfo: UserRequest, userFile: Express.Multer.File) {
    try {
      if (!userFile)
        throw new HttpException(
          '프로필 이미지를 업로드해야 합니다.',
          HttpStatus.BAD_REQUEST,
        );
      const { file, ...rest } = {
        ...userInfo,
        imageUrl: userFile.path,
      };

      const result = await this.usersRepository.createUser(rest);

      if (!result) {
        throw new HttpException(
          '사용자 생성에 실패했습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return result;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findAll() {
    try {
      const users = await this.usersRepository.findAll();
      return users;
    } catch (error) {
      ErrorHelper.handleError(error);
    }
  }

  async findOne(id: string) {
    try {
      return await this.usersRepository.findOne(id);
    } catch (error) {
      if (error instanceof mongoose.Error.CastError && error.path === '_id') {
        throw new HttpException(
          '잘못된 ID 형식입니다. 유효한 ObjectId를 제공해주세요.',
          HttpStatus.BAD_REQUEST,
        );
      }
      ErrorHelper.handleError(error);
    }
  }

  async update(
    id: string,
    userInfo: UpdateUserRequest,
    userFile: Express.Multer.File,
  ) {
    try {
      if (!userFile)
        throw new HttpException(
          '프로필 이미지를 업로드해야 합니다.',
          HttpStatus.BAD_REQUEST,
        );
      const { file, ...rest } = {
        ...userInfo,
        imageUrl: userFile.path,
      };
      const result = await this.usersRepository.update(id, rest as UserInfo);

      if (!result) {
        throw new HttpException(
          '사용자 업데이트에 실패했습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError && error.path === '_id') {
        throw new HttpException(
          '잘못된 ID 형식입니다. 유효한 ObjectId를 제공해주세요.',
          HttpStatus.BAD_REQUEST,
        );
      }
      ErrorHelper.handleError(error);
    }
  }

  async remove(id: string) {
    try {
      const result = await this.usersRepository.remove(id);
      if (!result) {
        throw new HttpException(
          '사용자 업데이트에 실패했습니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof mongoose.Error.CastError && error.path === '_id') {
        throw new HttpException(
          '잘못된 ID 형식입니다. 유효한 ObjectId를 제공해주세요.',
          HttpStatus.BAD_REQUEST,
        );
      }
      ErrorHelper.handleError(error);
    }
  }
}
