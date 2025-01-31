import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInfo, Users, UsersDocument } from './entities/user.entity';

export interface UsersRepository {
  findAll();
  findOne(id: string);
  createUser(userInfo: UserInfo);
  update(id: string, userInfo: UserInfo);
  remove(id: string);
}

@Injectable()
export class usersMongoRepository implements UsersRepository {
  constructor(
    @InjectModel(Users.name)
    private usersModel: Model<UsersDocument>,
  ) {}

  async findAll() {
    try {
      const usersDocument = await this.usersModel
        .findOne()
        .then((result) => result?.users);

      return usersDocument;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async findOne(id: string) {
    const usersDocument = await this.usersModel
      .findOne({ 'users._id': id }, { 'users.$': 1 })
      .lean() // 순수 JavaScript 객체 반환
      .then((result) => result?.users); // 결과에서 첫 번째 배열 요소 추출
    console.log(usersDocument);
    return usersDocument;
  }

  async createUser(userInfo: UserInfo) {
    // 기존 문서가 존재하는지 확인 및 업데이트 또는 새로 생성
    const updatedUser = await this.usersModel.findOneAndUpdate(
      {}, // 조건: 문서를 찾을 기준 (여기서는 첫 번째 문서만 확인)
      { $push: { users: userInfo } }, // 배열 필드에 userInfo 추가
      { upsert: true, new: true }, // 문서가 없으면 생성, 업데이트된 문서 반환
    );

    return updatedUser.users;
  }

  async update(id: string, userInfo: UserInfo) {
    const updatedDocument = await this.usersModel
      .findOneAndUpdate(
        { 'users._id': id },
        {
          $set: {
            'users.$.name': userInfo.name,
            'users.$.department': userInfo.department,
            'users.$.role': userInfo.role,
            'users.$.imageUrl': userInfo.imageUrl,
          },
        },
        { new: true },
      )
      .lean()
      .then((result) => result?.users);

    return updatedDocument;
  }

  async remove(id: string) {
    const removeDocument = await this.usersModel
      .findOneAndUpdate(
        { 'users._id': id },
        { $pull: { users: { _id: id } } },
        { new: true },
      )
      .lean()
      .then((result) => result?.users);

    if (!removeDocument) {
      throw new Error('User not found');
    }

    return removeDocument;
  }
}
