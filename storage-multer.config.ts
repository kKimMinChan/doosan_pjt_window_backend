import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid'; // UUID 라이브러리 사용 (npm install uuid)

export const FileStorageMulterConfig = {
  storage: diskStorage({
    destination: './file-storage', // 파일이 저장될 경로
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

      // 중복 방지를 위해 UUID 추가
      const uniqueSuffix = uuidv4(); // 또는 Date.now()를 사용할 수도 있음
      callback(null, `${baseName}_${uniqueSuffix}.${fileExtName}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
};
