FROM node:25-alpine3.21

WORKDIR /app

COPY ./files .

RUN npm install

ENTRYPOINT ["npm", "run", "dev"]
