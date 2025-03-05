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
import { UserRole } from './dto/request.dto';

export interface UsersRepository {
  findAllPaginated(skip: number, limit: number, role: UserRole);
  findAll();
  countUsers(role: UserRole);
  findOne(id: string);
  createUser(userInfo: UserInfo);
  update(id: string, userInfo: UserInfo);
  remove(id: string);
  findRole(id: string, role: 'INSPECTOR' | 'REVIEWER');
  findMissingUsers(userIds: string[]): Promise<string[]>;
}

@Injectable()
export class usersMongoRepository implements UsersRepository {
  constructor(
    @InjectModel(UserInfo.name)
    private usersModel: Model<UsersDocument>,
  ) {}

  async findAllPaginated(skip: number, limit: number, role: UserRole) {
    return await this.usersModel
      .find({ role })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);
  }
  async findAll() {
    const users = await this.usersModel.find().sort({ _id: -1 });
    return users;
    // const result = await this.usersModel.aggregate([
    //   {
    //     $group: {
    //       _id: '$role', // role을 기준으로 그룹화
    //       users: { $push: '$$ROOT' }, // 해당 role의 사용자 목록을 users 배열에 저장
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 0, // `_id` 필드 제거
    //       role: '$_id', // 기존 `_id` 값을 role 필드로 변경
    //       users: 1, // users 배열 유지
    //     },
    //   },
    // ]);

    // console.log(result, 'result');

    // // ✅ 반환된 배열을 객체 형태로 변환
    // return result.reduce((acc, curr) => {
    //   acc[curr.role] = curr.users; // role을 키로 하고 users 배열을 값으로 설정
    //   return acc;
    // }, {});
  }

  async countUsers(role: UserRole) {
    return this.usersModel.countDocuments({ role }).exec();
  }

  async findMissingUsers(userIds: string[]): Promise<string[]> {
    const existingUsers = await this.usersModel
      .find({ _id: { $in: userIds } })
      .select('_id')
      .lean();
    const existingIds = existingUsers.map((user) => user._id.toString());
    return userIds.filter((id) => !existingIds.includes(id));
  }

  async findOne(id: string) {
    const userDocument = await this.usersModel.findOne({ _id: id });
    if (!userDocument)
      throw new ResourceNotFoundError('등록된 사용자가 없습니다.');
    return userDocument;
  }

  async findRole(id: string, role: 'INSPECTOR' | 'REVIEWER') {
    return await this.usersModel.findOne({
      equipmentId: id,
      role,
      isDeleted: false,
    });
  }

  async createUser(userInfo: UserInfo) {
    if (userInfo.role === 'INSPECTOR' || userInfo.role === 'REVIEWER') {
      const existingUser = await this.usersModel.findOne({
        role: userInfo.role,
        equipmentId: userInfo.equipmentId,
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

  async update(id: string, userInfo: Partial<UserInfo>) {
    console.log(userInfo, 'info');

    const updateFields: Partial<UserInfo> = {};
    // 업데이트할 필드만 동적으로 추가
    if (userInfo.name) updateFields['name'] = userInfo.name;
    if (userInfo.department) updateFields['department'] = userInfo.department;
    if (userInfo.role) updateFields['role'] = userInfo.role;
    if (userInfo.imageUrl) updateFields['imageUrl'] = userInfo.imageUrl;
    // if (userInfo.isActive) updateFields['isActive'] = userInfo.isActive;

    // 업데이트할 값이 없으면 바로 반환
    if (Object.keys(updateFields).length === 0) {
      throw new Error('변경할 데이터가 없습니다.');
    }

    console.log(updateFields, 'updateFields');

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
