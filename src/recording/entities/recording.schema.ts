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
  cameraIps: string[] | [];

  @Prop()
  pythonServerIps: string[] | [];

  @Prop()
  rtspIps: string[] | [];
}

export const RecordingSchema = SchemaFactory.createForClass(Recording);
