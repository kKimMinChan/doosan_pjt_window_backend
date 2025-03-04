import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
const autopopulate = require('mongoose-autopopulate');

export type HeavyEquipmentDocument = HeavyEquipment & Document;

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
export class HeavyEquipment {
  @Prop({ required: true })
  factoryName: string;

  @Prop({ required: true, enum: ['forklift', 'bogie', 'crane', 'transporter'] })
  type: string;

  @Prop({ required: true })
  equipmentNumber: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo' }],
    required: false,
    autopopulate: true,
  })
  inspectors?: string[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo' }],
    required: false,
    autopopulate: true,
  })
  reviewers?: string[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserInfo' }],
    required: false,
    autopopulate: true,
  })
  drivers?: string[];

  // @Prop({ default: false })
  // isDeleted?: boolean;
}

export const HeavyEquipmentSchema =
  SchemaFactory.createForClass(HeavyEquipment);

HeavyEquipmentSchema.plugin(autopopulate);
