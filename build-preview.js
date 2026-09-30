const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const DIST_DIR = path.resolve(__dirname, 'dist');

if (!fs.existsSync(DIST_DIR)) {
  console.error('错误: 未找到 dist 目录，请先执行 npm run build 进行打包！');
  process.exit(1);
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, reqPath);
  
  if (reqPath === '/' || reqPath === '') {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  // 跨域支持
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // SPA 路由回退
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(path.join(DIST_DIR, 'index.html')).pipe(res);
  }
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`  EZ-Theme 生产打包预览服务已启动`);
  console.log(`  本地访问地址: http://localhost:${PORT}`);
  console.log(`  按 Ctrl+C 可停止预览服务`);
  console.log(`==================================================\n`);
});
