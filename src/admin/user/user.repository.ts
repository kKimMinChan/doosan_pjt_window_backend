import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInfo, UsersDocument } from './entities/user.entity';
import { ResourceNotFoundError } from 'src/helper/ErrorHelper';

export interface UsersRepository {
  findAll(skip: number, limit: number);
  countUsers();
  findOne(id: string);
  createUser(userInfo: UserInfo);
  update(id: string, userInfo: UserInfo);
  remove(id: string);
}

@Injectable()
export class usersMongoRepository implements UsersRepository {
  constructor(
    @InjectModel(UserInfo.name)
    private usersModel: Model<UsersDocument>,
  ) {}

  async findAll(skip: number, limit: number) {
    try {
      return (await this.usersModel.find().skip(skip).limit(limit)).reverse();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async countUsers() {
    return this.usersModel.countDocuments().exec();
  }

  // async findAll() {
  //   try {
  //     const usersDocument = await this.usersModel
  //       .findOne()
  //       .then((result) => result?.users);
  //     if (!usersDocument)
  //       throw new ResourceNotFoundError('등록된 사용자가 없습니다.');
  //     return usersDocument;
  //   } catch (error) {
  //     console.error('Error fetching users:', error);
  //     throw error;
  //   }
  // }

  async findOne(id: string) {
    const userDocument = await this.usersModel.findOne({ _id: id });
    if (!userDocument)
      throw new ResourceNotFoundError('등록된 사용자가 없습니다.');
    return userDocument;
  }

  async createUser(userInfo: UserInfo) {
    if (userInfo.role === '점검자' || userInfo.role === '확인자') {
      const existingUser = await this.usersModel.findOne({
        role: userInfo.role,
        heavyEquipmentId: userInfo.heavyEquipmentId,
      });

      if (existingUser) {
        throw new BadRequestException(
          `${userInfo.role}는 이미 할당된 상태입니다. 중복 할당은 불가능합니다.`,
        );
      }
    }

    const newUser = new this.usersModel(userInfo);
    return await newUser.save(); // 개별 문서로 저장

    // if (result.modifiedCount > 0) return result;

    // return null;
  }

  async update(id: string, userInfo: UserInfo) {
    const updateFields: Partial<UserInfo> = {};
    // 업데이트할 필드만 동적으로 추가
    if (userInfo.name) updateFields['name'] = userInfo.name;
    if (userInfo.department) updateFields['department'] = userInfo.department;
    if (userInfo.role) updateFields['role'] = userInfo.role;
    if (userInfo.imageUrl) updateFields['imageUrl'] = userInfo.imageUrl;
    if (typeof userInfo.isActive !== 'undefined')
      updateFields['isActive'] = userInfo.isActive;

    // 업데이트할 값이 없으면 바로 반환
    if (Object.keys(updateFields).length === 0) {
      throw new Error('변경할 데이터가 없습니다.');
    }

    console.log(updateFields);

    const result = await this.usersModel.updateOne(
      { _id: id }, // 바로 해당 사용자의 ID로 업데이트
      { $set: updateFields },
      { new: true },
    );

    console.log(result, 'result');

    // 업데이트가 이루어지지 않은 경우 (같은 데이터로 인해 변경되지 않음)
    if (result.modifiedCount === 0) {
      throw new HttpException(
        '같은 데이터를 입력하여 업데이트가 이루어지지 않았습니다.',
        HttpStatus.CONFLICT,
      );
    }

    if (result.modifiedCount > 0) return result;

    return null;
  }

  async remove(id: string) {
    const result = await this.usersModel.deleteOne({ _id: id });

    if (result.deletedCount > 0) return result;

    return null;
  }
}
