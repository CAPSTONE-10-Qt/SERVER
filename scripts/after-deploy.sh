#!/bin/bash
REPOSITORY=/home/ubuntu/build

cd $REPOSITORY


echo "1234" | sudo -S yarn
echo "1234" | sudo -S yarn db:pull 
echo "1234" | sudo -S yarn generate 
echo "1234" | sudo -S pm2 start dist
