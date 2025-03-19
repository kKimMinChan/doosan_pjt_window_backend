import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RecordingDocument = Recording & Document;

@Schema({
  toJSON: {
    transform: (doc, ret) => {
      delete ret._id; // _id 제거
      delete ret.__v; // __v 제거
    },
  },
})
export class Recording {
  @Prop()
  recordingTargets: string[] | [];

  @Prop()
  cameraStatusTargets: string[] | [];
}

export const RecordingSchema = SchemaFactory.createForClass(Recording);
