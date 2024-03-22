#!/bin/bash
REPOSITORY=/home/ubuntu/build

cd $REPOSITORY

/usr/bin/yarn
/usr/bin/yarn db:pull 
/usr/bin/yarn generate
/usr/bin/pm2 start dist