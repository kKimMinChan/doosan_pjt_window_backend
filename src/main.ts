import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  // const httpsOptions = {
  //   key: fs.readFileSync('/Users/kimminchan/localhost-key.pem'),
  //   cert: fs.readFileSync('/Users/kimminchan/localhost.pem'),
  // };

  const app = await NestFactory.create(AppModule, {
    // httpsOptions,
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
    origin: ['http://localhost:3000', 'http://192.168.0.10:3000'],
    credentials: true,
    // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    // allowedHeaders: 'Content-Type, Accept, Authorization',
    // preflightContinue: false,
    // optionsSuccessStatus: 204,
  });

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
