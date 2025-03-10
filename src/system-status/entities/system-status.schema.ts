import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SystemStatusDocument = SystemStatus & Document;

@Schema()
export class SystemStatus {
  @Prop()
  hasValidCheck: boolean;

  @Prop()
  hasValidWorkPlan: boolean;

  @Prop()
  isSignedWorkPlan: boolean;

  @Prop()
  isValidUser: boolean;

  @Prop()
  isSignedUser: boolean;
}

export const SystemStatusSchema = SchemaFactory.createForClass(SystemStatus);
