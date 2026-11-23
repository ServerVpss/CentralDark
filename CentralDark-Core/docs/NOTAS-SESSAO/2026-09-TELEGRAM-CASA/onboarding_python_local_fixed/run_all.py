import threading, time
from werkzeug.serving import make_server
from server import app
import test_onboarding

class LocalServer(threading.Thread):
    daemon = True
    def __init__(self):
        super().__init__()
        self.httpd = make_server("127.0.0.1", 3000, app)
        self.ctx = app.app_context()
        self.ctx.push()
    def run(self):
        self.httpd.serve_forever()
    def shutdown(self):
        self.httpd.shutdown()

if __name__ == "__main__":
    server = LocalServer()
    server.start()
    time.sleep(0.4)
    try:
        test_onboarding.run()
    finally:
        server.shutdown()
