FROM node:20-alpine

WORKDIR /app

COPY ../../../front .

RUN npm install

RUN npm run build

ENTRYPOINT ["npm", "run", "start"]
