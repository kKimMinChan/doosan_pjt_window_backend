import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type WorkPlanDocument = WorkPlan & Document;

type SignatureType = 'create' | 'approval' | 'finish';

class WorkPlanData<T> {
  @Prop({ type: Object, required: false }) // ✅ T가 어떤 타입이든 저장 가능
  data?: T;

  @Prop({ required: true })
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
  @Prop({ type: WorkPlanData, required: true })
  workPlanData: WorkPlanData<any>;

  @Prop({
    type: [
      {
        type: { type: String },
        url: { type: String },
      },
    ],
  })
  adminSignatures: {
    type: SignatureType;
    url: string;
  }[];

  @Prop({
    type: [
      {
        driver: { type: mongoose.Schema.Types.ObjectId },
        url: { type: String },
      },
    ],
  })
  driverSignatures: {
    driver: SignatureType;
    url: string;
  }[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HeavyEquipment',
    required: true,
  })
  heavyEquipment: string;
}

export const WorkPlanSchema = SchemaFactory.createForClass(WorkPlan);
