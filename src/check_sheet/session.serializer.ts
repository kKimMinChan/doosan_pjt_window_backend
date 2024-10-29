import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { CheckSheetService } from './check_sheet.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private checkSheetService: CheckSheetService) {
    super();
  }

  serializeUser(
    checkSheet: any,
    done: (err: Error, checkSheet: any) => void,
  ): any {
    console.log('serializeUser', checkSheet.checkSheetInfo.title);
    done(null, checkSheet.checkSheetInfo.title);
  }

  async deserializeUser(
    payload: any,
    done: (err: Error, payload: any) => void,
  ): Promise<any> {
    const checkSheet = await this.checkSheetService.getCheckSheet();
    console.log('DeserializeUser');
    if (!checkSheet.checkSheetInfo.title) {
      done(new Error('No CheckSheet'), null);
      return;
    }

    done(null, checkSheet);
  }
}
