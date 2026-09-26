#!/usr/bin/env python3
import json, os, urllib.request, urllib.error
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST = os.getenv('CENTRALDARK_BRIDGE_HOST', '127.0.0.1')
PORT = int(os.getenv('CENTRALDARK_BRIDGE_PORT', '9180'))
MCP = os.getenv('CENTRALDARK_MCP_LOCAL', 'http://127.0.0.1:9100/mcp')

INIT = json.dumps({
    'jsonrpc':'2.0','id':1,'method':'initialize',
    'params':{'protocolVersion':'2025-06-18','capabilities':{},
              'clientInfo':{'name':'centraldark-bridge-vps','version':'0.1.0'}}
}).encode()

def mcp_probe():
    req = urllib.request.Request(MCP, data=INIT, method='POST', headers={
        'Content-Type':'application/json',
        'Accept':'application/json, text/event-stream',
        'User-Agent':'CentralDarkBridgeVPS/0.1'
    })
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            return {'reachable': True, 'http': r.status}
    except urllib.error.HTTPError as e:
        return {'reachable': True, 'http': e.code, 'auth_or_protocol_gate': True}
    except Exception as e:
        return {'reachable': False, 'error': type(e).__name__ + ': ' + str(e)}

class H(BaseHTTPRequestHandler):
    def send_json(self, code, obj):
        raw = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(raw)))
        self.end_headers(); self.wfile.write(raw)
    def do_GET(self):
        if self.path == '/health':
            self.send_json(200, {'service':'centraldark-bridge','status':'ok','mcp':MCP,'remote_execution':False})
        elif self.path == '/mcp-probe':
            self.send_json(200, {'service':'centraldark-bridge','probe':mcp_probe()})
        elif self.path == '/architecture':
            self.send_json(200, {'flow':'CentralDark App -> MCP -> Tool Router -> Remote Bridge -> Local Agent -> Receipt -> Reality Judge','one_system_only':True,'unknown_is_not_pass':True})
        else:
            self.send_json(404, {'error':'not_found'})
    def log_message(self, fmt, *args):
        print('[CENTRALDARK-BRIDGE]', fmt % args, flush=True)

if __name__ == '__main__':
    print(f'CENTRALDARK_BRIDGE_LISTEN={HOST}:{PORT}', flush=True)
    ThreadingHTTPServer((HOST, PORT), H).serve_forever()
