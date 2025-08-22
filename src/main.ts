import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ResponseInterceptor } from './response/response.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ObjectIdValidationPipe } from './pipes/objectid-validation.pipe';
import { RecordingSeedService } from './recording/recording.seed.service';
import { createServer } from 'http';
import {
  // initializeWebSocketTp,
  wssTp,
} from './websocket/transGuard/tp.gateway';
import {
  // initializeWebSocketCrane,
  wssCrane,
} from './websocket/transGuard/crane.gateway';
import { wssTpSelectionSync } from './websocket/transGuard/tp-selection-sync.gateway';
import { join } from 'path';

// import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets('uploads', {
    prefix: '/uploads/',
  });

  app.enableCors({
    origin: '*', // 모든 출처 허용
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Doosan API Docs')
    .setDescription('Doosan API description')
    .setVersion('1.0')
    .addTag('Doosan')
    .build();

  app.useStaticAssets(join(__dirname, '..', 'public'));

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

  console.log('✅ Loaded MONGO_URI:', process.env.MONGO_URI);

  try {
    // 초기 데이터 삽입을 위한 서비스 가져오기
    const recordingSeedService = app.get(RecordingSeedService);

    // Seed 로직 실행 (seed() 메서드에서 초기 데이터 삽입)
    await recordingSeedService.seed();

    console.log('Seed 작업이 완료되었습니다.');
  } catch (error) {
    console.error('Seed 작업 중 에러 발생:', error);
  }

  await app.init();

  const httpAdapter = app.getHttpAdapter();
  const expressApp = httpAdapter.getInstance();
  const server = createServer(expressApp);

  // ← 이 위치! HTTP 서버 생성 후, WS 초기화 함수 호출 전 또는 후 상관없이 한 번만 등록
  server.on('upgrade', (req, socket, head) => {
    console.log('🔁 upgrade 요청 URL:', req.url);
    if (req.url === '/demo/tp') {
      wssTp.handleUpgrade(req, socket, head, (ws) => {
        wssTp.emit('connection', ws, req);
      });
    } else if (req.url === '/demo/crane') {
      wssCrane.handleUpgrade(req, socket, head, (ws) => {
        wssCrane.emit('connection', ws, req);
      });
    } else if (req.url === '/tp-selection') {
      wssTpSelectionSync.handleUpgrade(req, socket, head, (ws) => {
        wssTpSelectionSync.emit('connection', ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  // initializeWebSocketTp(server);
  // initializeWebSocketCrane(server);

  server.listen(4000, () => {
    console.log('✅ Nest + WebSocket 서버 실행 중: http://localhost:4000');
  });
}
bootstrap();
