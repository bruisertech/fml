import http.server, gzip, sys, os
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
    def send_head(self):
        path=self.translate_path(self.path.split('?')[0].split('#')[0])
        if os.path.isdir(path): path=os.path.join(path,'index.html')
        if not os.path.exists(path): return super().send_head()
        data=open(path,'rb').read()
        ctype=self.guess_type(path)
        if 'gzip' in self.headers.get('Accept-Encoding','') and any(path.endswith(x) for x in ('.js','.css','.html','.json')):
            data=gzip.compress(data,9); enc=True
        else: enc=False
        self.send_response(200); self.send_header('Content-Type',ctype); self.send_header('Content-Length',str(len(data)))
        if enc: self.send_header('Content-Encoding','gzip')
        self.end_headers()
        import io; return io.BytesIO(data)
os.chdir(sys.argv[1]); http.server.ThreadingHTTPServer(('',int(sys.argv[2])),H).serve_forever()
