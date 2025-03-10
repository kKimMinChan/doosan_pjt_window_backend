import { Body, Controller, Get, Header, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  )
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  healthCheck() {
    try {
      return {
        translate: 'OK',
      };
    } catch (error) {
      console.error(error);
    }
  }
}
