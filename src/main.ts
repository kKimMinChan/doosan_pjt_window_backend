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

    ws.send(
      JSON.stringify({
        event: 'connected',
        result: true,
        data: {
          videoWidth: 1280,
          videoHeight: 720,
        },
      }),
    );

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        console.log('Received message:', parsed);

        if (parsed.event === 'start-stream') {
          const {
            fps,
            outlierRate,
            outlierMultiplier,
            videoWidth,
            videoHeight,
            predictRate = 30,
            predictDuration = 3000,
            blockX,
            blockY,
            radius = 50,
            predictX,
            predictY,
          } = parsed.payload;

          console.log('Starting stream with params:', {
            fps,
            outlierRate,
            outlierMultiplier,
            videoWidth,
            videoHeight,
          });

          const intervalMs = 1000 / fps;

          let isInPredictMode = false;
          let predictModeTimeout: NodeJS.Timeout | null = null;

          let step = 0;
          let direction = 1;
          let d = 0;

          const totalSteps = 8;
          const stepIntervalCount = totalSteps * 2 - 2;
          const predictStepsPerEmit =
            predictDuration / (intervalMs * stepIntervalCount);

          const emitInterval = setInterval(() => {
            const now = Date.now();
            const isOutlier = Math.random() < outlierRate * 0.01;
            let x, y, x2, y2;

            // 랜덤 각도와 거리 생성
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * radius;
            const predictDistance = Math.random() * radius;

            // 정상값 또는 이상치
            const adjustedDistance = isOutlier
              ? distance * outlierMultiplier
              : distance;

            const predictAdjustedDistance = isOutlier
              ? predictDistance * outlierMultiplier
              : predictDistance;

            // 극좌표 → 직교좌표 변환
            x = Math.round(blockX + adjustedDistance * Math.cos(angle));
            y = Math.round(blockY + adjustedDistance * Math.sin(angle));
            x2 = Math.round(
              predictX + predictAdjustedDistance * Math.cos(angle),
            );
            y2 = Math.round(
              predictY + predictAdjustedDistance * Math.sin(angle),
            );

            // 예측 모드 진입 여부 체크
            if (!isInPredictMode && Math.random() < predictRate * 0.01) {
              isInPredictMode = true;
              step = 0;
              direction = 1;

              predictModeTimeout = setTimeout(() => {
                isInPredictMode = false;
                d = 0;
              }, predictDuration);
            }

            // 예측 모드 중이면 d 값 순차 전환
            if (isInPredictMode) {
              d = step;

              step += direction;
              if (step === totalSteps - 1) {
                direction = -1;
              } else if (step === 0 && direction === -1) {
                // 왕복 완료
                isInPredictMode = false;
                d = 0;
                clearTimeout(predictModeTimeout!);
              }
            }

            const payload: any = {
              event: 'position',
              result: true,
              data: {
                origin: { width: 1280, height: 720 },
                block: [{ x, y }],
              },
            };

            // 예측 모드인 경우 predict 추가
            if (isInPredictMode) {
              payload.data.predict = [{ x: x2, y: y2, d }];
            }

            ws.send(JSON.stringify(payload));
          }, intervalMs);

          clientIntervals.set(ws, { emitInterval, windowMoveInterval: null });
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

  server.listen(4000, () => {
    console.log(
      '✅ Nest + WebSocket 서버 실행 중: http://localhost:4000, wss://dev.fboedev.com/ws',
    );
  });
}
bootstrap();
