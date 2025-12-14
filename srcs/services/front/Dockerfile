FROM node:25-alpine3.21

WORKDIR /app

COPY ../../../front .

RUN npm install

RUN npm run build

ENTRYPOINT ["npm", "run", "start"]
