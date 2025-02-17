import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
const autopopulate = require('mongoose-autopopulate');

export type CheckSheetDocument = CheckSheet & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString(); // `_id`를 문자열로 변환하여 `id` 필드에 매핑
      delete ret._id; // `_id` 제거
      delete ret.__v; // `__v` 제거

      // ✅ `items` 배열 내부 변환 로직 추가
      if (ret.items && Array.isArray(ret.items)) {
        ret.items = ret.items.map((item) => {
          const newItem = {
            id: item._id?.toString(), // ✅ `_id`를 `id`로 변환
            checkItem: item.checkItem, // ✅ `checkItem`이 `ObjectId`면 그대로 유지
            isOk: item.isOk,
          };

          // ✅ `checkItem`이 객체로 populate() 된 경우 내부 `_id` 변환
          if (item.checkItem && typeof item.checkItem === 'object') {
            newItem.checkItem = {
              id: item.checkItem._id?.toString(), // ✅ checkItem 내부의 `_id`를 `id`로 변환
              ...item.checkItem, // ✅ 나머지 필드 유지
            };
            delete newItem.checkItem._id; // ✅ `_id` 제거
          }

          return newItem;
        });
      }
    },
  },
})
export class CheckSheet {
  @Prop({
    type: [
      {
        checkItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'CheckItem',
          required: true,
          autopopulate: false,
        },
        isOk: { type: Boolean, default: null },
      },
    ],
    required: true,
  })
  items: { checkItem: string | { id: string }; isOk: boolean | null }[];

  @Prop({
    type: [
      {
        _id: false,
        title: { type: String, required: true },
        index: { type: Number, required: true },
        url: { type: String, default: null },
      },
    ],
    required: false,
  })
  images?: { title: string; index: number; url: string | null }[];

  @Prop({ type: String, required: false })
  issue?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserInfo',
    required: true,
    autopopulate: false,
  })
  inspector: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserInfo',
    required: true,
    autopopulate: false,
  })
  reviewer: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HeavyEquipment',
    required: true,
    autopopulate: false,
  })
  heavyEquipment: string;
}

const CheckSheetSchema = SchemaFactory.createForClass(CheckSheet);
CheckSheetSchema.plugin(autopopulate);

export { CheckSheetSchema };
