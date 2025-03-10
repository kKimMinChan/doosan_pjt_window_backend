import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type WorkPlanDocument = WorkPlan & Document;

// type SignatureType = 'create' | 'approval' | 'finish';

export enum SignatureType {
  CREATE = 'create',
  FINISH = 'finish',
}

@Schema({ _id: false }) // ✅ _id 생성 방지 & 자동 populate 활성화
class MutableData {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserInfo',
    autopopulate: true,
  })
  writer: mongoose.Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  department: string;

  @Prop()
  leader: string;

  @Prop()
  specifications: string;

  @Prop()
  itemDetail: string;

  @Prop()
  route: string;

  @Prop()
  startDay: string;

  @Prop()
  endDay: string;
}

@Schema({ _id: false })
class UrlMode {
  @Prop({ type: String, required: false })
  dark?: string;

  @Prop({ type: String, required: false })
  white?: string;
}

const UrlModeSchema = SchemaFactory.createForClass(UrlMode);

@Schema({ _id: false })
class driverSignatures {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserInfo',
    required: false,
    autopopulate: false,
  })
  driver: mongoose.Types.ObjectId;

  @Prop({ type: UrlMode, required: false })
  urlMode?: UrlMode;
}

// ✅ MutableData 서브 스키마 등록
const MutableDataSchema = SchemaFactory.createForClass(MutableData);
MutableDataSchema.plugin(require('mongoose-autopopulate'));

class AdminSignature {
  @Prop({ type: UrlMode, required: false })
  url: UrlMode;
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
export class WorkPlan {
  @Prop({ type: MutableDataSchema, required: true })
  mutableData: MutableData;

  @Prop()
  fixedData: string;

  @Prop({ type: Object, required: false })
  adminSignatures?: Record<SignatureType, UrlMode>;

  @Prop({ type: [driverSignatures], required: false })
  driverSignatures: driverSignatures[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HeavyEquipment' }],
    required: false,
    autopopulate: true,
  })
  equipment: string[] | null;
}

export const WorkPlanSchema = SchemaFactory.createForClass(WorkPlan);

WorkPlanSchema.plugin(require('mongoose-autopopulate'));
