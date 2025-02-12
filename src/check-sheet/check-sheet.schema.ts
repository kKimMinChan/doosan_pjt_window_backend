import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CheckSheetInfoDocument = CheckSheetInfo & Document;

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
export class CheckItem {
  @Prop({
    required: true,
    enum: ['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'],
  })
  type: string;

  @Prop({
    required: true,
  })
  index: number;

  @Prop({ required: true, enum: ['문서', '육안', '기능'] })
  method: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: null })
  isOk?: boolean | null;
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
export class CheckSheetInfo {
  @Prop({ required: true, enum: ['지게차', '대차', '크레인'], unique: true })
  type: string;

  @Prop({ type: [CheckItem], required: true })
  checkItems: CheckItem[];

  @Prop({ required: false })
  imageUrls: string[];
}

export const CheckSheetInfoSchema =
  SchemaFactory.createForClass(CheckSheetInfo);
