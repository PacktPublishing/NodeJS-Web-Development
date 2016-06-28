FROM node:5.9

# ENV MYSQL_PORT=3306
# ENV MYSQL_HOST=db-auth
# ENV MYSQL_DATABASE=userauth
# ENV MYSQL_USER=userauth
# ENV MYSQL_PASSWORD=userauth

ENV DEBUG="users:*"
ENV PORT="3333"
ENV SEQUELIZE_CONNECT="sequelize-docker-mysql.yaml"
ENV REST_LISTEN="0.0.0.0"

RUN mkdir -p /usr/src/app

COPY . /usr/src/app/
WORKDIR /usr/src/app
RUN apt-get update -y \
    && apt-get -y install curl python build-essential git ca-certificates \
    && npm install --unsafe-perm

EXPOSE 3333

CMD npm run docker
