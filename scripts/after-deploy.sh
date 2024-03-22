#!/bin/bash
REPOSITORY=/home/ubuntu/build

cd $REPOSITORY


echo "1234" | sudo -S /usr/bin/yarn
echo "1234" | sudo -S /usr/bin/yarn db:pull 
echo "1234" | sudo -S /usr/bin/yarn generate 
echo "1234" | sudo -S /usr/bin/pm2 start dist
