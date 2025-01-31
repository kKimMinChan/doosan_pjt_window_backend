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
      .then((result) => result?.users); // 결과에서 첫 번째 배열 요소 추출
    console.log(usersDocument);
    return usersDocument;
  }

  async createUser(userInfo: UserInfo) {
    const createdDocument = await this.usersModel.updateOne(
      {}, // 조건: 첫 번째 문서를 대상으로 업데이트
      { $push: { users: userInfo } }, // 배열 필드에 userInfo 추가
      { upsert: true }, // 문서가 없으면 생성
    );
    console.log(createdDocument);
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
      .then((result) => result?.users);

    if (!removeDocument) {
      throw new Error('User not found');
    }

    return removeDocument;
  }
}
