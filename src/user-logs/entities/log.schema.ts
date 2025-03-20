import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
const autopopulate = require('mongoose-autopopulate');

export type UserLogDocument = UserLog & Document;

export enum EventType {
  FACE_RECOGNITION = 'face-recognition',
  STREAMING = 'streaming',
}

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString(); // _id를 문자열로 변환 후 id로 매핑
      delete ret._id; // _id 제거
      delete ret.__v; // __v 제거
    },
  },
})
export class UserLog {
  @Prop({
    required: true,
    enum: EventType,
  })
  event: string;

  @Prop()
  result: boolean | null;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserInfo',
    required: false,
    autopopulate: true,
  })
  user: mongoose.Types.ObjectId | null;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HeavyEquipment',
    required: false,
    autopopulate: true,
  })
  equipment: mongoose.Types.ObjectId | null;

  @Prop()
  imageUrl: string;
}

export const userLogSchema = SchemaFactory.createForClass(UserLog);
userLogSchema.plugin(autopopulate);
