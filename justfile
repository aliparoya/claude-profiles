# Local dev server management.
#
# `just serve`   — launch dev (3000) detached; survives shell exit
# `just stop`    — kill it via PID file
# `just restart` — stop + serve
# `just status`  — show running state
# `just logs`    — tail the dev log
# `just build`   — pnpm run build (static output into ./build)
#
# If you want pnpm scripts to resolve secrets through 1Password at process
# start, copy `.env.local.example` to `.env.local`, fill in the `op://`
# references, and edit package.json so `start`/`build` wrap commands with
# `op run --env-file=./.env.local --`. This template ships without that
# wrapper so the site boots with no extra setup.

set shell := ["bash", "-euo", "pipefail", "-c"]

pids_dir := ".local/pids"
logs_dir := ".local/logs"
dev_port := "3000"

# List recipes
default:
    @just --list

# Start dev server detached
serve:
    #!/usr/bin/env bash
    set -euo pipefail
    mkdir -p {{pids_dir}} {{logs_dir}}
    pid_file="{{pids_dir}}/dev.pid"
    if [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
        echo "dev already running (pid $(cat "$pid_file")). run 'just stop' first." >&2
        exit 1
    fi
    setsid bash -c 'exec pnpm start --host 0.0.0.0 --port {{dev_port}}' \
        > {{logs_dir}}/dev.log 2>&1 < /dev/null &
    echo $! > {{pids_dir}}/dev.pid
    sleep 1
    echo "dev:  http://localhost:{{dev_port}}  (pid $(cat {{pids_dir}}/dev.pid))"
    echo "logs: tail -f {{logs_dir}}/dev.log"

# Stop dev server
stop:
    #!/usr/bin/env bash
    set -uo pipefail
    pid_file="{{pids_dir}}/dev.pid"
    if [[ -f "$pid_file" ]]; then
        pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            kill -TERM -"$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
            for _ in 1 2 3 4 5; do
                kill -0 "$pid" 2>/dev/null || break
                sleep 0.5
            done
            kill -KILL -"$pid" 2>/dev/null || true
            echo "stopped dev (pid $pid)"
        else
            echo "dev not running (stale pid file)"
        fi
        rm -f "$pid_file"
    else
        echo "dev not running"
    fi

# Restart
restart: stop serve

# Show running state
status:
    #!/usr/bin/env bash
    pid_file="{{pids_dir}}/dev.pid"
    if [[ -f "$pid_file" ]] && kill -0 "$(cat "$pid_file")" 2>/dev/null; then
        echo "dev: running (pid $(cat "$pid_file"))"
    else
        echo "dev: not running"
    fi

# Tail dev log
logs:
    tail -f {{logs_dir}}/dev.log

# Static build
build:
    pnpm run build
