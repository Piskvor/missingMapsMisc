#!/usr/bin/python

import SimpleHTTPServer
import SocketServer

PORT=8080

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

httpd = SocketServer.TCPServer(("127.0.0.1", PORT), Handler)

httpd.serve_forever()


