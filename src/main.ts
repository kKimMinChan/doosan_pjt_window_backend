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
import { WebSocketServer, WebSocket } from 'ws';

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
  const wss = new WebSocketServer({ server, path: '/ws' });

  const clientIntervals = new Map<
    WebSocket,
    {
      emitInterval: NodeJS.Timeout;
      windowMoveInterval: NodeJS.Timeout;
    }
  >();

  wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());

        if (parsed.event === 'start-stream') {
          const {
            fps,
            outlierRate,
            outlierMultiplier,
            videoWidth,
            videoHeight,
          } = parsed.payload;

          const intervalMs = 1000 / fps;
          const windowWidth = Math.floor(videoWidth * 0.1);
          const windowHeight = Math.floor(videoHeight * 0.1);

          let currentRange = randomMovingWindow(
            videoWidth,
            videoHeight,
            windowWidth,
            windowHeight,
          );

          const windowMoveInterval = setInterval(() => {
            currentRange = randomMovingWindow(
              videoWidth,
              videoHeight,
              windowWidth,
              windowHeight,
            );
            console.log('📸 카메라 이동:', currentRange);
          }, 3000);

          const emitInterval = setInterval(() => {
            const isOutlier = Math.random() < outlierRate * 0.01;
            const { xMin, xMax, yMin, yMax } = currentRange;

            let x = Math.random() * (xMax - xMin) + xMin;
            let y = Math.random() * (yMax - yMin) + yMin;

            if (isOutlier) {
              x *= outlierMultiplier;
              y *= outlierMultiplier;
            }

            ws.send(
              JSON.stringify({
                event: 'position',
                result: true,
                payload: { x, y, outlier: isOutlier },
              }),
            );
          }, intervalMs);

          clientIntervals.set(ws, { emitInterval, windowMoveInterval });
        }

        if (parsed.event === 'stop-stream') {
          clearClient(ws);
          ws.send(JSON.stringify({ event: 'stopped', result: true }));
        }
      } catch (err) {
        console.error('Invalid message:', message);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
      clearClient(ws);
    });
  });

  function clearClient(ws: WebSocket) {
    const timers = clientIntervals.get(ws);
    if (timers) {
      clearInterval(timers.emitInterval);
      clearInterval(timers.windowMoveInterval);
      clientIntervals.delete(ws);
    }
  }

  function randomMovingWindow(
    videoWidth: number,
    videoHeight: number,
    windowWidth: number,
    windowHeight: number,
  ) {
    const xMin = Math.floor(Math.random() * (videoWidth - windowWidth));
    const yMin = Math.floor(Math.random() * (videoHeight - windowHeight));
    return {
      xMin,
      xMax: xMin + windowWidth,
      yMin,
      yMax: yMin + windowHeight,
    };
  }

  server.listen(4000, () => {
    console.log(
      '✅ Nest + WebSocket 서버 실행 중: http://localhost:4000, wss://dev.fboedev.com/ws',
    );
  });
}
bootstrap();
