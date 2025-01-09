import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CheckSheetDocument = CheckSheet & Document;

@Schema()
export class CheckSheetInfo {
  @Prop({ required: true })
  factory_name: string;

  @Prop({ required: true })
  equipment_name: string;

  @Prop({ required: true })
  equipment_number: string;

  @Prop({ required: true })
  inspector: string;

  @Prop({ required: true })
  checker: string;
}

@Schema()
export class CheckList {
  @Prop({
    required: true,
    enum: ['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'],
  })
  division: string;

  @Prop({ required: true })
  number: number;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: ['문서', '육안', '기능'] })
  method: string;
}

@Schema()
export class CheckItem {
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

  @Prop({ default: true })
  check: boolean;
}

@Schema()
export class CheckedList {
  @Prop({
    required: true,
    type: [CheckItem],
  })
  checkedItem: CheckItem[];

  @Prop({
    required: true,
    validate: {
      validator: (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value),
      message: (props) =>
        `${props.value}는 유효한 날짜 형식이 아닙니다. (YYYY-MM-DD 형식)`,
    },
  })
  date: string;

  @Prop({ required: false })
  issue?: string;

  _id?: string;
}

@Schema()
export class Image {
  base64?: string;
  image_url?: string;
}

@Schema()
export class CheckSheet {
  @Prop({ type: CheckSheetInfo, required: true })
  checkSheetInfo: CheckSheetInfo;

  @Prop({ type: [CheckList], required: true })
  checkLists: CheckList[];

  @Prop({ type: [Image], required: false })
  image: Image[];

  @Prop({ type: [CheckedList], required: false })
  checkedLists?: CheckedList[];
}

export const CheckSheetSchema = SchemaFactory.createForClass(CheckSheet);
