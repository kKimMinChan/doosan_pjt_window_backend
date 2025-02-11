import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date, Types } from 'mongoose';

export type CheckedListsDocument = CheckedSheet & Document;

@Schema({
  _id: false, // _id 필드 생성 비활성화
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v; // __v 제거
    },
  },
})
export class CheckedItem {
  @Prop({
    required: true,
    enum: ['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'],
  })
  division: string;

  @Prop({ required: true, enum: ['문서', '육안', '기능'] })
  method: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  number: number;

  @Prop({ required: true })
  check: boolean;
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
export class CheckedSheet {
  @Prop({
    required: true,
    type: [CheckedItem],
  })
  checkedItems: CheckedItem[];

  @Prop({
    required: true,
  })
  date: string;

  @Prop({ required: false })
  issue?: string;

  @Prop({ type: mongoose.Schema.ObjectId, ref: 'checkSheet', required: true })
  checkSheetId: string;

  @Prop({ type: mongoose.Schema.ObjectId, ref: 'UserInfo', required: true })
  inspectorId: string;

  @Prop({ type: mongoose.Schema.ObjectId, ref: 'UserInfo', required: true })
  reviewerId: string;
}

export const CheckedSheetSchema = SchemaFactory.createForClass(CheckedSheet);
