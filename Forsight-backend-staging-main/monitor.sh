#!/bin/bash

LOG_FILE="//home/forsight/home/forsight/work/Forsight-backend/monitor.log"
ENV_PATH="/home/forsight/home/forsight/work/myenv/bin/activate"
PROJECT_PATH="/home/forsight/home/forsight/work/Forsight-backend"

# Check if Django server is running
if ! pgrep -f "manage.py runserver" > /dev/null
then
    echo "$(date): Django server is down! Restarting..." >> $LOG_FILE
    source $ENV_PATH
    cd $PROJECT_PATH
    nohup python3 manage.py runserver 0.0.0.0:8000 >> server.log 2>&1 &
else
    echo "$(date): Django server is running fine." >> $LOG_FILE
fi
