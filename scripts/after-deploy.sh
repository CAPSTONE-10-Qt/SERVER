#!/bin/bash
REPOSITORY=/home/ubuntu/build

cd $REPOSITORY

#? dependencies 설치
echo 'Installing Dependencies ...'
yarn
/usr/bin/yarn db:pull 

#? Prisma 사전 작업
echo 'Generating Prisma ...'
generate 

#? PM2로 서버 실행
echo 'Starting server with PM2 ...'
pm2 start dist
