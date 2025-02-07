import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FileStorageDocument = FileStorage & Document;

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
export class FileInfo {
  @Prop({ required: true })
  imageUrl: string;
}

export const FileInfoSchema = SchemaFactory.createForClass(FileInfo);

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
export class FileStorage {
  @Prop({ type: [], required: true }) // FileInfoSchema 참조
  files: string[];
}

export const FileStorageSchema = SchemaFactory.createForClass(FileStorage);
