import { Module } from '@nestjs/common';
import { CheckSheetService } from './check-sheet.service';
import { CheckSheetController } from './check-sheet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckSheet, CheckSheetSchema } from './entities/check-sheet.schema';
import { CheckSheetMongoRepository } from './check-sheet.repository';
import { CheckItemMongoRepository } from 'src/check-item/check-item.repository';
import { CheckItemModule } from 'src/check-item/check-item.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerOptionsFactory } from 'multer.s3';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CheckSheet.name, schema: CheckSheetSchema },
    ]),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        multerOptionsFactory(configService),
    }),
    CheckItemModule,
  ],
  controllers: [CheckSheetController],
  providers: [
    CheckSheetService,
    CheckSheetMongoRepository,
    CheckItemMongoRepository,
  ],
})
export class CheckSheetModule {}
