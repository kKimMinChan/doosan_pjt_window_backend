import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { userLogsMongoRepository } from './logs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { UserLog, userLogSchema } from './entities/log.schema';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerOptionsFactory } from 'src/config/multer.s3';
import { UserModule } from 'src/admin/user/user.module';
import { usersMongoRepository } from 'src/admin/user/user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserLog.name, schema: userLogSchema }]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        multerOptionsFactory(configService),
    }),
    UserModule,
  ],
  controllers: [LogsController],
  providers: [LogsService, userLogsMongoRepository, usersMongoRepository],
})
export class LogsModule {}
