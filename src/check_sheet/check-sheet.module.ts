import { Module } from '@nestjs/common';
import { CheckSheetController } from './check-sheet.controller';
import { CheckSheetService } from './check-sheet.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckSheet, CheckSheetSchema } from './check-sheet.schema';
import { CheckSheetMongoRepository } from './check-sheet.repository';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CheckSheet.name, schema: CheckSheetSchema },
    ]),
    PassportModule.register({ session: true }),
  ],
  controllers: [CheckSheetController],
  providers: [CheckSheetService, CheckSheetMongoRepository],
})
export class CheckSheetModule {}
