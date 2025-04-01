import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { UpdateQuery } from 'mongoose';

export type UsersDocument = UserInfo & Document;

export type UserRole = 'driver' | 'inspector' | 'reviewer' | 'admin';

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      if (ret._id) {
        ret.id = ret._id.toString(); // _id를 문자열로 변환 후 id로 매핑
        delete ret._id; // _id 제거
      }
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
  role: UserRole;

  @Prop({ default: false })
  isDeleted?: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop({
    type: mongoose.Schema.ObjectId,
    ref: 'HeavyEquipment',
    required: false,
  })
  equipmentId?: string;
}

export const UsersSchema = SchemaFactory.createForClass(UserInfo);

UsersSchema.pre(
  ['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete', 'countDocuments'],
  function (next) {
    const query = this as mongoose.Query<any, UsersDocument>;
    const options = query.getOptions?.();
    // console.log(options?.source, 'options');

    if (options?.source === 'populate') {
      console.log('next??');
      return next(); // populate에서 호출한 경우 필터 생략
    }

    query.where({ isDeleted: false });
    next();
  },
);

UsersSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 5184000 });
