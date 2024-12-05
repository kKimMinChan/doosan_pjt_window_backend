import { readFile } from 'fs/promises';

export async function getBase64Image(
  imageUrl: string,
  name?: string, // 선택적 매개변수로 설정
): Promise<{ base64: string; image_url: string; name?: string } | null> {
  try {
    if (imageUrl) {
      const imageBuffer = await readFile(imageUrl);
      const base64Image = {
        base64: `data:image/png;base64,${imageBuffer.toString('base64')}`,
        image_url: imageUrl,
      };

      // name이 있으면 base64Image에 추가
      if (name) {
        return { ...base64Image, name };
      }
      return base64Image;
    }
    return null; // null을 반환하여 일관된 반환값 유지
  } catch (error) {
    console.error(`Error reading file at ${imageUrl}: ${error}`);
    return null;
  }
}

export async function getBase64Thumbnail(
  imageUrl: string,
): Promise<string | null> {
  try {
    if (imageUrl) {
      const imageBuffer = await readFile(imageUrl);
      return `data:image/png;base64,${imageBuffer.toString('base64')}`;
    }
    return null; // null을 반환하여 일관된 반환값 유지
  } catch (error) {
    console.error(`Error reading file at ${imageUrl}: ${error}`);
    return null;
  }
}
