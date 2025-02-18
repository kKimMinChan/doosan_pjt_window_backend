import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multerS3 from 'multer-s3';
import * as path from 'path';

export const multerOptionsFactory = (
  configService: ConfigService,
): MulterOptions => {
  const s3 = new S3Client({
    region: configService.get('AWS_BUCKET_REGION'),
    credentials: {
      accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
    },
  });
  return {
    storage: multerS3({
      s3,
      bucket: configService.get('AWS_BUCKET_NAME'),
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key(_req, file, done) {
        const fileExtName = file.originalname.split('.').pop();

        // 파일 이름을 UTF-8로 인코딩하고 다시 디코드
        const buffer = Buffer.from(file.originalname, 'latin1').toString(
          'utf8',
        );

        // 안전한 파일 이름으로 결합
        const safeName = buffer
          .replace(/[\\?<>\\:\\*\\|"]/g, '')
          .replace(/\./g, '_')
          .replace(/#/g, '_')
          .replace(/%/g, '_');

        const lastIndex = safeName.lastIndexOf('_');
        const baseName = safeName.substring(0, lastIndex);
        // console.log('Full file object:', file);
        const ext = path.extname(file.originalname);
        // const basename = path.basename(file.originalname, ext);
        done(null, `images/${Date.now()}${ext}`);
        // done(null, `images/${baseName}_${Date.now()}${ext}`);
        console.log('이미지 등록');
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  };
};
