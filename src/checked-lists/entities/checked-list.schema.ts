import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type CheckedListsDocument = CheckedLists & Document;

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

@Schema()
export class CheckedList {
  @Prop({
    required: true,
    type: [CheckedItem],
  })
  checkedItem: CheckedItem[];

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

export const CheckedListSchema = SchemaFactory.createForClass(CheckedList);

@Schema()
export class CheckedLists {
  @Prop({ type: [CheckedListSchema] }) // CheckedList의 배열
  checkedLists: CheckedList[];
}

export const CheckedListsSchema = SchemaFactory.createForClass(CheckedLists);
