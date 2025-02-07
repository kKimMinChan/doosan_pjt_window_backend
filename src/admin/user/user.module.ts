import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserInfo, UsersSchema } from './entities/user.entity';
import { usersMongoRepository } from './user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserInfo.name, schema: UsersSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService, usersMongoRepository],
})
export class UserModule {}
