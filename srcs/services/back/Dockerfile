FROM node:24-alpine3.21

WORKDIR /app

COPY ../../../back .

RUN npm install && npm audit fix

RUN npm run build

ENTRYPOINT ["npm", "run", "start"]