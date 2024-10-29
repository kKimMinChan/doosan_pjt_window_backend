import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { CheckSheetService } from './check_sheet.service';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private authService: CheckSheetService) {}
  async canActivate(context: any): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log(request, 'request');
    if (request.cookies['login']) return true;

    if (!request.body.password) return false;

    console.log(request.body.password, 'guard');
    const checkSheet = await this.authService.login(request.body.password);

    if (!checkSheet) {
      return false;
    }

    request.checkSheet = checkSheet;
    return true;
  }
}

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    console.log('LocalAuthGuard', result);
    await super.logIn(request);
    return result;
  }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('check AuthenticatedGuard');
    const request = context.switchToHttp().getRequest();
    console.log(
      'AuthenticatedGuard',
      request.isAuthenticated(),
      request.cookies['connect.sid'],
    );
    return request.isAuthenticated();
  }
}
