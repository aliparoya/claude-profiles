#!/usr/bin/env bash
# extract-baseline-prompt.sh
#
# Captures the baseline Claude Code system prompt — what the binary ships
# with no user CLAUDE.md, no settings, no plugins, no skills, and no MCP
# servers layered on top. The per-machine dynamic sections (cwd, OS info,
# git status, memory path) are kept in, so the audience sees the full
# prompt their session would actually receive on this machine.
#
# How it works
#   1. Spins up a tiny local HTTP server on a random loopback port.
#   2. Runs `claude -p "ok"` with:
#        - ANTHROPIC_BASE_URL pointed at the local server
#        - a dummy API key (no real call is made)
#        - CLAUDE_CONFIG_DIR set to an empty temp dir so user settings,
#          plugins, skills, and CLAUDE.md don't leak into the capture
#        - the real shell cwd preserved so the dynamic Environment section
#          reflects this machine
#   3. The mock server records the first POST to /v1/messages and replies
#      with a synthetic SSE stream so claude exits cleanly.
#   4. Extracts the `system` field from the captured body and prints it.
#
# No real Anthropic / Bedrock call is made. No credentials are needed.
#
# Usage
#   ./extract-baseline-prompt.sh                   # print to stdout
#   ./extract-baseline-prompt.sh -o baseline.txt   # write to file

set -euo pipefail

OUTPUT=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        -o|--output) OUTPUT="${2:?}"; shift 2 ;;
        -h|--help)   sed -n '2,22p' "$0"; exit 0 ;;
        *) echo "unknown arg: $1" >&2; exit 2 ;;
    esac
done

command -v claude  >/dev/null || { echo "'claude' not on PATH" >&2; exit 1; }
command -v python3 >/dev/null || { echo "'python3' is required"  >&2; exit 1; }

WORK="$(mktemp -d -t claude-baseline.XXXXXX)"
trap 'kill "${SRV_PID:-0}" 2>/dev/null || true; rm -rf "$WORK"' EXIT

cat > "$WORK/server.py" <<'PYEOF'
import http.server, socketserver, sys, threading, time
body_path = sys.argv[1]
captured = threading.Event()
SSE = [
    'event: message_start\ndata: {"type":"message_start","message":{"id":"m","type":"message","role":"assistant","content":[],"model":"x","stop_reason":null,"stop_sequence":null,"usage":{"input_tokens":1,"output_tokens":1,"cache_read_input_tokens":0,"cache_creation_input_tokens":0}}}\n\n',
    'event: content_block_start\ndata: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}\n\n',
    'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"ok"}}\n\n',
    'event: content_block_stop\ndata: {"type":"content_block_stop","index":0}\n\n',
    'event: message_delta\ndata: {"type":"message_delta","delta":{"stop_reason":"end_turn","stop_sequence":null},"usage":{"output_tokens":1}}\n\n',
    'event: message_stop\ndata: {"type":"message_stop"}\n\n',
]
class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a, **k): pass
    def do_POST(self):
        n = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(n)
        if "/v1/messages" in self.path and not captured.is_set():
            with open(body_path, "wb") as f: f.write(body)
            captured.set()
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.end_headers()
        for ev in SSE:
            try: self.wfile.write(ev.encode()); self.wfile.flush()
            except BrokenPipeError: return
    def do_GET(self):
        self.send_response(200); self.send_header("Content-Type","application/json"); self.end_headers()
        self.wfile.write(b'{"data":[]}')
with socketserver.TCPServer(("127.0.0.1", 0), H) as s:
    print(s.server_address[1], flush=True)
    s.timeout = 30
    deadline = time.time() + 60
    while not captured.is_set() and time.time() < deadline:
        s.handle_request()
PYEOF

python3 "$WORK/server.py" "$WORK/body.json" > "$WORK/port" 2>"$WORK/srv.err" &
SRV_PID=$!
for _ in $(seq 1 60); do [[ -s "$WORK/port" ]] && break; sleep 0.05; done
[[ -s "$WORK/port" ]] || { echo "mock server failed to bind" >&2; cat "$WORK/srv.err" >&2; exit 1; }
PORT="$(cat "$WORK/port")"

mkdir -p "$WORK/cfg"
# Run from the user's actual cwd so the captured Environment section
# (Primary working directory, git status, etc.) reflects this machine.
# Only CLAUDE_CONFIG_DIR is isolated, which excludes user CLAUDE.md,
# settings, plugins, skills, and MCP from leaking into the prompt.
env \
    ANTHROPIC_BASE_URL="http://127.0.0.1:$PORT" \
    ANTHROPIC_API_KEY="sk-ant-extract-dummy" \
    CLAUDE_CONFIG_DIR="$WORK/cfg" \
    DISABLE_AUTOUPDATER=1 \
    DISABLE_TELEMETRY=1 \
    timeout 60 claude -p "ok" \
        >/dev/null 2>"$WORK/claude.err" </dev/null || true

for _ in $(seq 1 80); do [[ -s "$WORK/body.json" ]] && break; sleep 0.05; done
[[ -s "$WORK/body.json" ]] || { echo "no /v1/messages body captured" >&2; tail -10 "$WORK/claude.err" >&2; exit 1; }

emit() {
    python3 - "$WORK/body.json" <<'PY'
import json, sys
sysf = json.load(open(sys.argv[1])).get("system")
if isinstance(sysf, str):
    print(sysf)
elif isinstance(sysf, list):
    print("\n\n".join(b.get("text", json.dumps(b)) for b in sysf))
else:
    sys.exit("unexpected `system` field type")
PY
}

if [[ -n "$OUTPUT" ]]; then
    emit > "$OUTPUT"
    SIZE="$(wc -c < "$OUTPUT")"
    VER="$(claude --version 2>/dev/null | awk '{print $1}')"
    echo "wrote baseline prompt to $OUTPUT ($SIZE bytes, claude $VER)" >&2
else
    emit
fi
