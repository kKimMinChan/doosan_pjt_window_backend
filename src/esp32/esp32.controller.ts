import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as extract from 'extract-zip';
import * as archiver from 'archiver';
import { exec } from 'child_process';

@Controller('esp32')
export class Esp32Controller {
  @Post('upload')
  async handleUpload(
    @Body('folderName') folderName: string,
    @Res() res: Response,
  ) {
    try {
      console.log('Upload request received for folder:', folderName);
      const downloadDirPath = join(os.homedir(), 'Downloads');
      const zipFilePath = join(downloadDirPath, folderName);

      // 압축 해제
      await extract(zipFilePath, { dir: downloadDirPath });
      console.log('Unzipped successfully to', downloadDirPath);

      // 압축 해제된 폴더 내의 두 개의 폴더 압축
      const extractedFolderPath = join(
        downloadDirPath,
        folderName.replace('.zip', ''),
      );
      const folders = fs.readdirSync(downloadDirPath).filter((file) => {
        return (
          fs.statSync(join(downloadDirPath, file)).isDirectory() &&
          (file.startsWith('1_') || file.startsWith('2_'))
        );
      });

      // 각 폴더의 이미지를 사용하여 영상 생성
      for (const folder of folders) {
        const folderPath = join(downloadDirPath, folder);
        const outputVideoPath = join(downloadDirPath, `${folder}.mp4`);

        // ffmpeg 명령어를 사용하여 이미지들을 영상으로 합치기
        const command = `ffmpeg -y -pattern_type glob -framerate 20 -i '${folderPath}/*.jpg' -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -r 20 ${outputVideoPath}`;

        await new Promise((resolve, reject) => {
          exec(command, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error creating video for ${folder}:`, error);
              reject(error);
            } else {
              console.log(`Video created successfully at ${outputVideoPath}`);
              resolve(stdout);
            }
          });
        });

        // 폴더 삭제
        fs.rmdirSync(folderPath, { recursive: true });
        console.log(`Deleted folder: ${folderPath}`);
      }

      return res.status(200).send('Folders zipped successfully');
    } catch (error) {
      console.error('Error processing upload:', error);
      return res.status(500).send('Internal server error');
    }
  }
}
