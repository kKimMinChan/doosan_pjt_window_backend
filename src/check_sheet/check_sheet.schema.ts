import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CheckSheetDocument = CheckSheet & Document;

@Schema()
export class CheckSheetInfo {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  factory_name: string;

  @Prop({ required: true })
  equipment_name: string;

  @Prop({ required: true })
  equipment_number: string;

  @Prop({ required: true })
  inspector: string;

  @Prop({ required: true })
  checker: string;
}

@Schema()
export class CheckList {
  @Prop({
    required: true,
    enum: ['핵심 항목', '작업전 점검사항(법적)', '일반항목'],
  })
  division: string;

  @Prop({ required: true })
  number: number;

  @Prop({ required: true })
  check_item: string;

  @Prop({ required: true, enum: ['문서', '육안', '기능', ''] })
  method: string;
}

@Schema()
export class CheckItem {
  @Prop({
    required: true,
    enum: ['핵심 항목', '작업전 점검사항(법적)', '일반항목'],
  })
  division: string;

  @Prop({ required: true, enum: ['문서', '육안', '기능', ''] })
  method: string;

  @Prop({ required: true })
  check_item: string;

  @Prop({ required: true })
  number: number;

  @Prop({ required: true })
  check: boolean;
}

@Schema()
export class CheckedList {
  item: CheckItem[];
  date: string;
  issue?: string;
}

@Schema()
export class Image {
  base64?: string;
  image_url?: string;
}

// @Schema()
// export class DriversImage {
//   name?: string;
//   base64?: string;
//   image_url?: string;
// }

// @Schema()
// export class DriverSignature {
//   name?: string;
//   signatureImage?: {
//     base64?: string;
//     image_url?: string;
//   };
// }

// @Schema()
// export class WorkPlan {
//   date?: string;
//   workPlanImage: {
//     base64?: string;
//     image_url: string;
//   };
//   signature?: {
//     draft?: {
//       base64?: string;
//       image_url?: string;
//     };
//     authorization?: {
//       base64?: string;
//       image_url?: string;
//     };
//     approval?: {
//       base64?: string;
//       image_url?: string;
//     };
//     driver?: DriverSignature[];
//   };
// }

@Schema()
export class CheckSheet {
  @Prop({ type: CheckSheetInfo, required: true })
  checkSheetInfo: CheckSheetInfo;

  @Prop({ type: [CheckList], required: true })
  checkLists: CheckList[];

  @Prop({ type: [Image], required: false })
  image: Image[];

  @Prop({ type: [CheckedList], required: false })
  checkedList: CheckedList[];

  // @Prop({ type: [DriversImage], required: false })
  // driversImage: DriversImage[];

  @Prop({ required: true })
  password: string;

  // @Prop({ type: [WorkPlan], required: true })
  // workPlan: WorkPlan[];
}

export const CheckSheetSchema = SchemaFactory.createForClass(CheckSheet);
