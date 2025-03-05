import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

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

  @Prop({ required: true, enum: ['driver', 'inspector', 'reviewer', 'admin'] })
  role: string;

  // @Prop({ default: false })
  // status?: boolean;

  @Prop({
    type: mongoose.Schema.ObjectId,
    ref: 'HeavyEquipment',
    required: false,
  })
  equipmentId?: string;
}

export const UsersSchema = SchemaFactory.createForClass(UserInfo);

// UsersSchema.index(
//   { role: 1, equipmentId: 1 },
//   {
//     unique: false,
//     partialFilterExpression: {
//       role: { $in: ['inspector', 'reviewer'] },
//     },
//   },
// );
