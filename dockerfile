FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV LIVEBLOCKS_SECRET_KEY="sk_dummy"
ENV LIVEBLOCKS_PUBLIC_KEY="pk_dummy"
ENV ADMIN_EMAILS=tjehdtns03@gmail.com
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]