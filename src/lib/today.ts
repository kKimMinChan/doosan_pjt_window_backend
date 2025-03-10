import { ConflictException } from '@nestjs/common';

export const today = <T extends { createdAt?: Date | string }>(data: T) => {
  const date = new Date(
    new Date().getTime() + 1000 * 60 * 60 * 9,
  ).toISOString();

  const kstLatest = data?.createdAt
    ? new Date(
        new Date(data.createdAt).getTime() + 1000 * 60 * 60 * 9,
      ).toISOString()
    : null; // createdAt이 없을 경우 null 반환

  if (kstLatest) {
    if (date.split('T')[0] === kstLatest.split('T')[0])
      console.log(date, kstLatest);
    throw new ConflictException('금일 데이터가 존재합니다.');
  }

  return kstLatest;
};
