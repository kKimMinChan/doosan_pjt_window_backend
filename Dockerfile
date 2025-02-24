# Step 1: 빌드 단계 (builder 스테이지 추가)
FROM node:22.13.1 AS builder
WORKDIR /app
# 패키지 설치
COPY package.json package-lock.json ./
RUN npm install
# 소스 코드 복사 및 NestJS 빌드
COPY . .
RUN npm run build
# Step 2: 실행 단계 (Node.js 버전 맞춤)
FROM node:22.13.1-alpine AS runtime
WORKDIR /app
# 실행에 필요한 파일만 복사
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm install --only=production
# 빌드된 dist 폴더만 복사
COPY --from=builder /app/dist ./dist
# 실행 명령어
CMD ["node", "dist/src/main"]
#