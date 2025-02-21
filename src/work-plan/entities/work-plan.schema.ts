import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type WorkPlanDocument = WorkPlan & Document;

// type SignatureType = 'create' | 'approval' | 'finish';

class WorkPlanData<T> {
  @Prop({ type: Object, required: false }) // ✅ T가 어떤 타입이든 저장 가능
  data?: T;

  @Prop({ required: true })
  url: string;
}

export enum SignatureType {
  CREATE = 'create',
  APPROVAL = 'approval',
  FINISH = 'finish',
}

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
  @Prop({ type: WorkPlanData, required: true })
  workPlanData: WorkPlanData<any>;

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
    driver: SignatureType;
    url: string;
  }[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HeavyEquipment',
    required: false,
  })
  heavyEquipment: string | null;
}

export const WorkPlanSchema = SchemaFactory.createForClass(WorkPlan);
