#!/bin/bash
sudo su    
visudo -f /etc/sudoers

REPOSITORY=/home/ubuntu/build

cd $REPOSITORY

sudo /usr/bin/yarn
sudo /usr/bin/yarn db:pull 
sudo /usr/bin/yarn generate
sudo /usr/bin/pm2 start dist