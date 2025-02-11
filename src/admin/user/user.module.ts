import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserInfo, UsersSchema } from './entities/user.entity';
import { usersMongoRepository } from './user.repository';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerOptionsFactory } from 'multer.s3';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserInfo.name, schema: UsersSchema }]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        multerOptionsFactory(configService),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, usersMongoRepository],
})
export class UserModule {}
