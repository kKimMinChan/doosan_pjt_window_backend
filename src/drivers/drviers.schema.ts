import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DriversDocument = Drivers & Document;

@Schema()
export class DriversImage {
  name?: string;
  base64?: string;
  image_url?: string;
}

@Schema()
export class Drivers {
  @Prop({ type: [DriversImage], required: true })
  driversImage: DriversImage[];
}

export const DriversSchema = SchemaFactory.createForClass(Drivers);
