const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`收到请求: ${req.method} ${req.url}`);
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello from test server', time: new Date() }));
});

server.listen(4000, '0.0.0.0', () => {
  console.log('测试服务器运行在 http://0.0.0.0:4000');
});
