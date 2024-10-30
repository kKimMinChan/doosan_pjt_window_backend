import { diskStorage } from 'multer';

export const MulterConfig = {
  storage: diskStorage({
    destination: './uploads', // 파일이 저장될 경로
    filename: (req, file, callback) => {
      const fileExtName = file.originalname.split('.').pop();

      // 파일 이름을 UTF-8로 인코딩하고 다시 디코드
      const buffer = Buffer.from(file.originalname, 'latin1').toString('utf8');

      // 안전한 파일 이름으로 결합
      const safeName = buffer
        .replace(/[\\?<>\\:\\*\\|"]/g, '')
        .replace(/\./g, '_')
        .replace(/#/g, '_')
        .replace(/%/g, '_');

      const lastIndex = safeName.lastIndexOf('_');
      const baseName = safeName.substring(0, lastIndex);
      // console.log(baseName, 'safe', fileExtName, 'ext', buffer);
      callback(null, `${baseName}.${fileExtName}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
};
