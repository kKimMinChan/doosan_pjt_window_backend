import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CheckItemDocument = CheckItem & Document;

@Schema({
  toJSON: {
    transform: (doc, ret) => {
      if (ret._id) {
        ret.id = ret._id.toString(); // _id를 문자열로 변환 후 id로 매핑
        delete ret._id;
      } // _id 제거
      delete ret.__v; // __v 제거
    },
  },
})
export class CheckItem {
  @Prop({
    required: true,
    enum: ['key-item', 'checklist-before-work', 'general-item'],
  })
  type: string;

  @Prop({ required: true, enum: ['eye', 'document', 'function'] })
  method: string;

  @Prop({ required: true })
  content: string;
}

export const CheckItemSchema = SchemaFactory.createForClass(CheckItem);
