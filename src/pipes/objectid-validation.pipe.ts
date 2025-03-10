import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class ObjectIdValidationPipe implements PipeTransform {
  transform(value: any) {
    // console.log(`Raw ID Value:`, value, `Type:`, typeof value); // ✅ 타입 확인

    const trimmedValue = String(value).trim(); // ✅ 강제 문자열 변환 후 trim

    console.log(mongoose.Types.ObjectId.isValid(trimmedValue)); // ✅ 확인용 로그 추가

    if (!mongoose.Types.ObjectId.isValid(trimmedValue)) {
      throw new BadRequestException('잘못된 ID 형식입니다.');
    }
    return trimmedValue;
  }
}
