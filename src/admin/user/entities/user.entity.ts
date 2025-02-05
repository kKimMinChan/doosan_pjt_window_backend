import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UsersDocument = UserInfo & Document;

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
export class UserInfo {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true, enum: ['운전자', '점검자', '확인자', '관리자'] })
  role: string;

  @Prop({ required: false, default: true })
  isActive?: boolean;

  @Prop({ required: true })
  heavyEquipmentId: string;
}

export const UsersSchema = SchemaFactory.createForClass(UserInfo);

UsersSchema.index(
  { role: 1, heavyEquipmentId: 1 },
  {
    unique: true,
    partialFilterExpression: { role: { $in: ['점검자', '확인자'] } },
  },
);
