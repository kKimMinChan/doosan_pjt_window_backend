import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date, Types } from 'mongoose';

export type CheckedListsDocument = CheckedSheet & Document;

@Schema()
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

// @Schema()
// export class CheckedList {
//   @Prop({
//     required: true,
//     type: [CheckedItem],
//   })
//   checkedItem: CheckedItem[];

//   @Prop({
//     required: true,
//   })
//   date: Date;

//   @Prop({ required: false })
//   issue?: string;

//   @Prop({ required: true })
//   checkSheetId: string;
// }

// export const CheckedListSchema = SchemaFactory.createForClass(CheckedList);

@Schema()
export class CheckedSheet {
  @Prop({
    required: true,
    type: [CheckedItem],
  })
  checkedItems: CheckedItem[];

  @Prop({
    required: true,
    type: Date,
  })
  date: Date;

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
