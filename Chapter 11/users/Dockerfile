FROM node:5.9

# ENV DEBUG="users:*"
ENV PORT="3333"
# ENV SEQUELIZE_CONNECT="sequelize-docker-mysql.yaml"
ENV REST_LISTEN="0.0.0.0"
# ENV HOST_USERS_TEST="localhost"
# ENV NODE_ENV="production"

RUN mkdir -p /usr/src/app

COPY . /usr/src/app/
WORKDIR /usr/src/app
RUN apt-get update -y \
    && apt-get -y install curl python build-essential git ca-certificates \
    && rm -rf node_modules \
    && npm install --unsafe-perm

EXPOSE 3333

CMD npm run docker
