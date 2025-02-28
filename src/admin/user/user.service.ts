import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateUserRequest, UserRequest } from './dto/request.dto';
import { usersMongoRepository } from './user.repository';
import { ErrorHelper } from 'src/helper/ErrorHelper';
import mongoose from 'mongoose';
import { PaginationDto } from 'src/common-dto/pagination.dto';

@Injectable()
export class UserService {
  constructor(private usersRepository: usersMongoRepository) {}
  async createUser(userInfo: UserRequest, userFile: Express.MulterS3.File) {
    try {
      if (!userFile)
        throw new HttpException(
          '프로필 이미지를 업로드해야 합니다.',
          HttpStatus.BAD_REQUEST,
        );
      // console.log(userFile, process.env.NODE_ENV, 'userFile');
      const { file, ...rest } = {
        ...userInfo,
        imageUrl:
          process.env.NODE_ENV === 'production'
            ? 'path' in userFile
              ? userFile.path
              : null
            : 'key' in userFile
              ? userFile.key
              : null,
        // : `https://${process.env.CLOUDFRONT_URL}/${userFile.key}`,
      };

      console.log(rest, 'rest');

      const result = await this.usersRepository.createUser(rest);
      console.log(result, 'result');
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

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit, page } = paginationDto;

      const skip = (page - 1) * limit;

      const [data, totalCount] = await Promise.all([
        this.usersRepository.findAll(skip, limit),
        this.usersRepository.countUsers(),
      ]);

      return {
        pageSize: limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        page,
        data,
      };
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
    userFile: Express.MulterS3.File,
  ) {
    try {
      const updateData = {
        ...userInfo,
        ...(userFile && { imageUrl: userFile.key }),
      };

      const result = await this.usersRepository.update(id, updateData as any);

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
      console.error(error, 'asdfoniwe');
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
