import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { CheckSheetService } from './check_sheet.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private checkSheetService: CheckSheetService) {
    super({
      usernameField: 'title', // 클라이언트가 제출하는 요청에서 사용자 이름으로 사용될 필드 명시
      passwordField: 'password', // 비밀번호 필드도 명시적으로 설정
    });
  }

  async validate(title: string, password: string): Promise<any> {
    console.log('validate', title, password);
    const checkSheet = await this.checkSheetService.login(password);
    if (!checkSheet) return null;
    return checkSheet;
  }
}
