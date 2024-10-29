import { Module } from '@nestjs/common';
import { CheckSheetController } from './check_sheet.controller';
import { CheckSheetService } from './check_sheet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckSheet, CheckSheetSchema } from './check_sheet.schema';
import { CheckSheetMongoRepository } from './check_sheet.repository';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CheckSheet.name, schema: CheckSheetSchema },
    ]),
    PassportModule.register({ session: true }),
  ],
  controllers: [CheckSheetController],
  providers: [
    CheckSheetService,
    CheckSheetMongoRepository,
    LocalStrategy,
    SessionSerializer,
  ],
})
export class CheckSheetModule {}
