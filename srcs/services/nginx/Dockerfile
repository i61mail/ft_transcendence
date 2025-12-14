FROM debian:12-slim

RUN apt update -y && apt upgrade -y && apt install sudo

RUN sudo mkdir -p /etc/nginx/ssl && apt install -y openssl

RUN sudo openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/selfsigned.key \
  -out /etc/nginx/ssl/selfsigned.crt \
  -days 365 \
  -subj "/CN=transcendance.com"

RUN apt install nginx -y

RUN sudo service nginx start

COPY ./tools/nginx.conf /etc/nginx/sites-available/default

ENTRYPOINT ["nginx", "-g", "daemon off;"]

