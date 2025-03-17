import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type LogDocument = Log & Document;

@Schema({ timestamps: true })
export class Log {
  @Prop({
    required: true,
    enum: ['face-recognition', 'streaming'],
  })
  event: string;

  @Prop()
  result: boolean | null;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserInfo',
    required: true,
    autopopulate: true,
  })
  user: mongoose.Types.ObjectId;

  @Prop()
  imageUrl: string;
}
