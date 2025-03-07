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
}

// ✅ MutableData 서브 스키마 등록
const MutableDataSchema = SchemaFactory.createForClass(MutableData);
MutableDataSchema.plugin(require('mongoose-autopopulate'));

class AdminSignature {
  @Prop({ type: String, enum: SignatureType, required: true })
  type: SignatureType;

  @Prop({ type: String, required: true })
  url: string;
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

  @Prop({ type: [AdminSignature], required: false })
  adminSignatures?: AdminSignature[];

  @Prop({
    type: [
      {
        driver: { type: mongoose.Schema.Types.ObjectId },
        url: { type: String },
      },
    ],
    _id: false,
  })
  driverSignatures: {
    driver: string;
    url?: string;
  }[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HeavyEquipment' }],
    required: false,
    autopopulate: true,
  })
  equipment: string[] | null;
}

export const WorkPlanSchema = SchemaFactory.createForClass(WorkPlan);

WorkPlanSchema.plugin(require('mongoose-autopopulate'));
