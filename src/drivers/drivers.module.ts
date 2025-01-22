import { Module } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { MongooseModule } from '@nestjs/mongoose';
import { driversMongoRepository } from './drivers.repository';
import { Users, UsersSchema } from './drviers.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Users.name, schema: UsersSchema }]),
  ],
  controllers: [DriversController],
  providers: [DriversService, driversMongoRepository],
  exports: [DriversService],
})
export class DriversModule {}
