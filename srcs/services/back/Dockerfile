FROM node:24-alpine3.21

WORKDIR /app

COPY ./files .

RUN npm install && npm audit fix

RUN npm install --save-dev @types/speakeasy @types/qrcode

ENTRYPOINT ["npm", "run", "dev"]