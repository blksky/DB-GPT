#!/bin/sh

process_name=main_manage
BASE_DIR=$(cd `dirname $0`;cd ..;pwd)
PID_FILE="$BASE_DIR/pid/service.pid"

main_pid=$(cat $PID_FILE)
child_pids=$(pgrep -P $main_pid -d' ' -f)

kill -9 $main_pid

if [ -z "$child_pids" ]; then
    echo "No ${process_name} processes are running."
else
    echo "Killing ${process_name} processes:"
    echo -e "\t ${child_pids}"
    
    for pid in $child_pids; do
        kill $pid
        if [ $? -eq 0 ]; then
            echo -e "\t\tProcess ${process_name} with PID ${pid} has been killed."
        else
            echo -e "\t\tFailed to kill process ${process_name} with PID ${pid}."
        fi
    done
fi

rm $PID_FILE