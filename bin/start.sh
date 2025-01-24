#!/usr/bin/env bash

BASE_DIR=$(cd `dirname $0`;cd ..;pwd)
ROOT_DIR=$BASE_DIR

PID_DIR=$ROOT_DIR/pid
LOG_DIR=$ROOT_DIR/logs
PID_FILE=$PID_DIR/service.pid
MAIN_PY="$ROOT_DIR/dbgpt/app/dbgpt_server.py"

if [ ! -d $PID_DIR ];then
  mkdir $PID_DIR
fi

if [ ! -d $LOG_DIR ];then
  mkdir $LOG_DIR
fi

nohup python $MAIN_PY >$LOG_DIR/service.log 2>&1 & echo $!>$PID_FILE