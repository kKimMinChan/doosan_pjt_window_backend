import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SystemStatusDocument = SystemStatus & Document;

@Schema({
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id; // _id 제거
      delete ret.__v; // __v 제거
    },
  },
})
export class SystemStatus {
  @Prop()
  hasValidCheckSheet: boolean;

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
