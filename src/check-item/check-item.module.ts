import { Module } from '@nestjs/common';
import { CheckItemService } from './check-item.service';
import { CheckItemController } from './check-item.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckItem, CheckItemSchema } from './entities/check-item.schema';
import { CheckItemMongoRepository } from './check-item.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CheckItem.name, schema: CheckItemSchema },
    ]),
  ],

  controllers: [CheckItemController],
  providers: [CheckItemService, CheckItemMongoRepository],
  exports: [CheckItemMongoRepository, MongooseModule],
})
export class CheckItemModule {}
