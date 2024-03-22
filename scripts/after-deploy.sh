#!/bin/bash
REPOSITORY=/home/ubuntu/build

cd $REPOSITORY


sudo -S /usr/bin/yarn
sudo -S /usr/bin/yarn db:pull 
sudo -S /usr/bin/yarn generate 
sudo -S /usr/bin/pm2 start dist
