"""Static server for design/ai-ethics-ui that tells the browser never to cache (live editing)."""
import http.server
import sys

class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *args):
        pass

http.server.ThreadingHTTPServer(("127.0.0.1", 8765), lambda *a: NoCache(*a, directory=sys.argv[1])).serve_forever()
