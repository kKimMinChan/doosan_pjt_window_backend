// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// export type UsersDocument = Users & Document;

// @Schema()
// export class DriversImage {
//   name?: string;
//   base64?: string;
//   image_url?: string;
// }

// @Schema({ timestamps: true })
// export class UserInfo {
//   @Prop({ required: true })
//   name: string;

//   @Prop({ required: true })
//   department: string;

//   @Prop({ required: true })
//   imageUrl: string;

//   @Prop({ required: true, enum: ['운전자', '점검자', '확인자', '관리자'] })
//   role: string;

//   @Prop({ required: false, default: true })
//   isActive?: boolean;

//   createdAt?: Date;
//   updatedAt?: Date;
// }

// @Schema()
// export class Users {
//   @Prop({ type: [DriversImage], required: true })
//   driversImage: DriversImage[];
//   @Prop({ type: [UserInfo], required: true })
//   users: UserInfo[];
// }

// export const UsersSchema = SchemaFactory.createForClass(Users);
