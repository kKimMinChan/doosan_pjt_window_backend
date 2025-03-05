import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type WorkPlanDocument = WorkPlan & Document;

// type SignatureType = 'create' | 'approval' | 'finish';

export enum SignatureType {
  CREATE = 'create',
  FINISH = 'finish',
}

class WorkPlanData {
  @Prop({ required: true })
  writer: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  leader: string;

  @Prop()
  specifications: string;

  @Prop()
  itemDetail: string;

  @Prop()
  route: string;

  @Prop({ type: [String] })
  methods: string[];

  @Prop({ type: [String] })
  movingPathHazards: string[]; // 이동경로 위험사항

  @Prop({ type: [String] })
  loadingUnloadingHazards: string[]; // 하역운반 작업 위험사항

  @Prop({ type: [String] })
  tipOverPrevention: string[]; // 전도위험방지

  @Prop({ type: [String] })
  fallPrevention: string[]; // 낙하위험방지

  @Prop({ type: [String] })
  contactCollisionPrevention: string[]; // 접촉충돌 위험방지

  @Prop({ type: [String] })
  crushPrevention: string[]; // 협착위험방지

  @Prop({ type: [String] })
  collapsePrevention: string[]; // 붕괴위험방지

  @Prop({ type: [String] })
  fallHazardPrevention: string[]; // 추락위험방비

  @Prop({ type: [String] })
  safetyInspection: string[]; // 안전점검

  @Prop({ type: [String] })
  safetyRegulations: string[]; // 안전수칙
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
  workPlanData: WorkPlanData;

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
  equipment: string | null;
}

export const WorkPlanSchema = SchemaFactory.createForClass(WorkPlan);
