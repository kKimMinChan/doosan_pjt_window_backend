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
  check_item: string;

  @Prop({ required: true, enum: ['문서', '육안', '기능', ''] })
  method: string;
}

@Schema()
export class CheckItem {
  @Prop({
    required: true,
    enum: ['핵심 항목', '작업 전 점검사항(법적)', '일반 항목'],
  })
  division: string;

  @Prop({ required: true, enum: ['문서', '육안', '기능', ''] })
  method: string;

  @Prop({ required: true })
  check_item: string;

  @Prop({ required: true })
  number: number;

  @Prop({ required: true })
  check: boolean;
}

@Schema()
export class CheckedList {
  item: CheckItem[];
  date: string;
  issue?: string;
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
  checkedList?: CheckedList[];
}

export const CheckSheetSchema = SchemaFactory.createForClass(CheckSheet);
