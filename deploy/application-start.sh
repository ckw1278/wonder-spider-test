#!/usr/bin/env bash

cd /home/ec2-user/inch-storelink

NODE_ENV=$DEPLOYMENT_GROUP_NAME pm2 reload pm2-batch.json
