#!/bin/sh

process_name=dbgpt_server
BASE_DIR=$(cd `dirname $0`;cd ..;pwd)
PID_FILE="$BASE_DIR/pid/service.pid"

main_pid=$(cat $PID_FILE)
child_pids=$(pgrep -P $main_pid -d' ' -f)

kill -9 $main_pid

echo -e "\t\tProcess ${process_name} with PID ${main_pid} has been killed."

rm $PID_FILE