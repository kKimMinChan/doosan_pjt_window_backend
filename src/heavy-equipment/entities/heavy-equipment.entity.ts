import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  @Prop({ required: true, enum: ['지게차', '대차', '크레인'] })
  type: string;

  @Prop({ required: true })
  equipmentNumber: string;

  @Prop({ required: false, default: true })
  isActive?: boolean;
}

export const HeavyEquipmentSchema =
  SchemaFactory.createForClass(HeavyEquipment);
