import { Module } from '@nestjs/common';
import { WorkPlanController } from './work-plan.controller';
import { WorkPlanService } from './work-plan.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkPlan, WorkPlanSchema } from './work-plan.schema';
import { WorkPlanMongoRepository } from './work-plan.repository';
import { DriversModule } from 'src/drivers/drivers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkPlan.name, schema: WorkPlanSchema },
    ]),
    DriversModule,
  ],
  controllers: [WorkPlanController],
  providers: [WorkPlanService, WorkPlanMongoRepository],
})
export class WorkPlanModule {}
