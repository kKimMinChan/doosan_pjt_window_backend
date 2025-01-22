import { Injectable } from '@nestjs/common';
import { UserRequest } from './dto/request.dto';
import { usersMongoRepository } from './user.repository';
import { promisify } from 'util';
import * as fs from 'fs';
const readFile = promisify(fs.readFile);

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
    const users = await this.usersRepository.findAll();
    return users;
  }

  async findOne(id: string) {
    return await this.usersRepository.findOne(id);
  }

  async update(
    id: string,
    userInfo: UserRequest,
    UserFile: Express.Multer.File,
  ) {
    const { file, ...rest } = {
      ...userInfo,
      imageUrl: UserFile.path,
    };
    return await this.usersRepository.update(id, rest);
  }

  async remove(id: string) {
    return await this.usersRepository.remove(id);
  }
}
