import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false }) // Mongoose 스키마로 설정
export class Image {
  @Prop({ _id: false })
  base64?: string;

  @Prop({ _id: false })
  image_url?: string;
}

// Mongoose 스키마 생성
export const ImageSchema = SchemaFactory.createForClass(Image);
