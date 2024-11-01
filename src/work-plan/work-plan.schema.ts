import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Image, ImageSchema } from 'src/common_schema/Image.schema';

export type WorkPlanDocument = WorkPlan & Document;

@Schema({ _id: false }) // _id 생성 비활성화
export class DriverSignature {
  @Prop()
  name?: string;

  @Prop({ type: ImageSchema, _id: false }) // ImageSchema 사용, _id 비활성화
  signatureImage?: Image;
}

// DriverSignatureSchema 생성
export const DriverSignatureSchema =
  SchemaFactory.createForClass(DriverSignature);

@Schema({ timestamps: true })
export class WorkPlanItem {
  @Prop({ type: ImageSchema, required: true, _id: false }) // ImageSchema 사용
  workPlanImage: Image;

  @Prop({
    type: {
      draft: { type: ImageSchema, _id: false },
      authorization: { type: ImageSchema, _id: false },
      approval: { type: ImageSchema, _id: false },
      driver: [{ type: DriverSignatureSchema, _id: false }], // DriverSignatureSchema 사용
    },
  })
  signature?: {
    draft?: Image;
    authorization?: Image;
    approval?: Image;
    driver?: DriverSignature[];
  };
  createdAt?: Date;
}

// WorkPlanItemSchema 생성
export const WorkPlanItemSchema = SchemaFactory.createForClass(WorkPlanItem);

@Schema()
export class WorkPlan {
  @Prop({ type: [WorkPlanItemSchema], required: true })
  workPlanList: WorkPlanItem[];
}

export const WorkPlanSchema = SchemaFactory.createForClass(WorkPlan);
