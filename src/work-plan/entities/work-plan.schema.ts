import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type WorkPlanDocument = WorkPlan & Document;

// type SignatureType = 'create' | 'approval' | 'finish';

export enum SignatureType {
  CREATE = 'create',
  FINISH = 'finish',
}

class MutableData {
  @Prop({
    type: { type: mongoose.Schema.ObjectId, ref: 'UserInfo' },
    autopopulate: true,
  })
  writer: string;

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
  @Prop({ type: MutableData, required: true })
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
    driver: SignatureType;
    url: string;
  }[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HeavyEquipment' }],
    required: false,
    autopopulate: true,
  })
  equipment: string[] | null;
}

export const WorkPlanSchema = SchemaFactory.createForClass(WorkPlan);
