#!/usr/bin/env bash
# capture-active-prompt.sh
#
# Captures the *full* request body Claude Code sends on the first turn of a
# session, using your real CLAUDE_CONFIG_DIR — i.e. with all your settings,
# CLAUDE.md files, plugins, skills, and MCP servers in play. This is what
# your actual day-to-day sessions look like over the wire.
#
# Output is the literal /v1/messages JSON body, pretty-printed. The `system`
# field shows the assembled system prompt (one or more text blocks, often
# with cache_control set). The `tools` field shows what tool schemas are
# being shipped upfront. With ENABLE_TOOL_SEARCH on, you should see a small
# upfront set plus the ToolSearch entry; without it, every MCP tool is here.
#
# How it works
#   Same trick as extract-baseline-prompt.sh — a local mock server at
#   ANTHROPIC_BASE_URL captures the request body before forwarding nothing.
#   The difference: this script does NOT isolate CLAUDE_CONFIG_DIR, and
#   does NOT set --exclude-dynamic-system-prompt-sections, so the capture
#   reflects your real environment.
#
# No real Anthropic / Bedrock call is made. No credentials are needed.
#
# Usage
#   ./capture-active-prompt.sh                          # print JSON to stdout
#   ./capture-active-prompt.sh -o request.json          # write to file

set -euo pipefail

OUTPUT=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        -o|--output) OUTPUT="${2:?}"; shift 2 ;;
        -h|--help)   sed -n '2,26p' "$0"; exit 0 ;;
        *) echo "unknown arg: $1" >&2; exit 2 ;;
    esac
done

command -v claude  >/dev/null || { echo "'claude' not on PATH" >&2; exit 1; }
command -v python3 >/dev/null || { echo "'python3' is required"  >&2; exit 1; }

WORK="$(mktemp -d -t claude-active.XXXXXX)"
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

# Note: no isolation here — claude inherits your real CLAUDE_CONFIG_DIR,
# settings, CLAUDE.md, plugins, skills, and MCP servers from the shell.
env \
    ANTHROPIC_BASE_URL="http://127.0.0.1:$PORT" \
    ANTHROPIC_API_KEY="sk-ant-capture-dummy" \
    DISABLE_AUTOUPDATER=1 \
    DISABLE_TELEMETRY=1 \
    timeout 60 claude -p "ok" \
        >/dev/null 2>"$WORK/claude.err" </dev/null || true

for _ in $(seq 1 80); do [[ -s "$WORK/body.json" ]] && break; sleep 0.05; done
[[ -s "$WORK/body.json" ]] || { echo "no /v1/messages body captured" >&2; tail -10 "$WORK/claude.err" >&2; exit 1; }

if [[ -n "$OUTPUT" ]]; then
    python3 -m json.tool "$WORK/body.json" > "$OUTPUT"
    SIZE="$(wc -c < "$OUTPUT")"
    SYS_LEN="$(python3 -c 'import json,sys; b=json.load(open(sys.argv[1])); s=b.get("system",[]); print(sum(len(x.get("text","")) for x in s) if isinstance(s,list) else len(s))' "$OUTPUT")"
    TOOLS="$(python3 -c 'import json,sys; print(len(json.load(open(sys.argv[1])).get("tools",[])))' "$OUTPUT")"
    VER="$(claude --version 2>/dev/null | awk '{print $1}')"
    echo "wrote active request body to $OUTPUT ($SIZE bytes; system=$SYS_LEN chars; tools=$TOOLS; claude $VER)" >&2
else
    python3 -m json.tool "$WORK/body.json"
fi
