import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './\bfilters/all-exceptions.filter';
import { ResponseInterceptor } from './response/response.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';

// import * as fs from 'fs';

async function bootstrap() {
  // const httpsOptions = {
  //   key: fs.readFileSync('/Users/kimminchan/localhost-key.pem'),
  //   cert: fs.readFileSync('/Users/kimminchan/localhost.pem'),
  // };

  // const app = await NestFactory.create(AppModule, {
  //   // httpsOptions,
  // });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets('uploads', {
    prefix: '/uploads/',
  });

  app.enableCors({
    // origin: function (origin, callback) {
    //   if (!origin) {
    //     callback(null, true);
    //   } else {
    //     // 모든 출처를 허용하거나, 필요에 따라 특정 조건을 추가하여 필터링
    //     callback(null, true);
    //   }
    // },
    origin: '*', // 모든 출처 허용
    credentials: true,
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // allowedHeaders: 'Content-Type, Accept, Authorization',
    // preflightContinue: false,
    // optionsSuccessStatus: 204,
  });

  const config = new DocumentBuilder()
    .setTitle('Doosan API Docs')
    .setDescription('Doosan API description')
    .setVersion('1.0')
    .addTag('Doosan')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true, // 인증 정보 유지
      docExpansion: 'none', // 기본적으로 문서 접힘 상태
      showCommonExtensions: true, // 공통 확장 정보 표시
      supportedSubmitMethods: ['get', 'post', 'put', 'delete'], // 활성화할 HTTP 메서드
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
      deepLinking: true, // URL로 직접 이동 가능
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // ✅ DTO 타입 변환 활성화
      whitelist: true, // ✅ DTO에 정의되지 않은 필드 자동 제거
      forbidNonWhitelisted: false, // ✅ 정의되지 않은 필드가 있어도 예외 발생 X
      skipMissingProperties: true, // ✅ undefined 필드를 무시하여 검증
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.use(cookieParser());
  app.use(
    session({
      secret: 'very-important-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 360000,
        httpOnly: true,
        sameSite: 'none',
        secure: false, // 프로덕션 환경에서만 활성화
        // secure: process.env.NODE_ENV === 'production', // 프로덕션 환경에서만 활성화
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(4000);
}
bootstrap();
