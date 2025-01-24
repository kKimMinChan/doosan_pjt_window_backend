import { Injectable } from '@nestjs/common';
import { UpdateUserRequest, UserRequest } from './dto/request.dto';
import { usersMongoRepository } from './user.repository';
import { UserInfo } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private usersRepository: usersMongoRepository) {}
  async createUser(userInfo: UserRequest, UserFile: Express.Multer.File) {
    const { file, ...rest } = {
      ...userInfo,
      imageUrl: UserFile.path,
    };

    return await this.usersRepository.createUser(rest);
  }

  async findAll() {
    try {
      const users = await this.usersRepository.findAll();
      return users;
    } catch (error) {
      console.error(error);
    }
  }

  async findOne(id: string) {
    return await this.usersRepository.findOne(id);
  }

  async update(
    id: string,
    userInfo: UpdateUserRequest,
    UserFile: Express.Multer.File,
  ) {
    const { file, ...rest } = {
      ...userInfo,
      imageUrl: UserFile.path,
    };
    return await this.usersRepository.update(id, rest as UserInfo);
  }

  async remove(id: string) {
    return await this.usersRepository.remove(id);
  }
}
