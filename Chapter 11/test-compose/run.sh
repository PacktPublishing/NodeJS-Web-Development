#!/bin/sh

set -x

docker-compose stop

docker-compose up --build --force-recreate -d

docker ps
docker network ls

docker exec -it notesapp-test npm install -g phantomjs-prebuilt@2.1.7 casperjs@1.1.0-beta5
docker exec -it notesapp-test npm install mocha@2.4.5 chai@3.5.0

docker exec -it notesapp-test npm run test-docker-notes-memory
docker exec -it notesapp-test npm run test-docker-notes-fs
docker exec -it notesapp-test npm run test-docker-notes-levelup
docker exec -it notesapp-test npm run test-docker-notes-sqlite3
docker exec -it notesapp-test npm run test-docker-notes-sequelize-sqlite
docker exec -it notesapp-test npm run test-docker-notes-sequelize-mysql

docker exec -it userauth-test npm run setupuser
docker exec -it notesapp-test npm run test-docker-ui

docker exec -it userauth-test npm install mocha@2.4.5 chai@3.5.0

docker exec -it userauth-test npm run test-docker

docker-compose stop
