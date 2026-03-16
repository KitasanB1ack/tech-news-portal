const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// 禁用 etag 和缓存
app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Database connection
const dbPath = '/root/.openclaw/workspace/tech-news-site/database/tech-news.db';
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database error:', err);
  } else {
    console.log('✅ Database connected');
  }
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.get('/api/categories', (req, res) => {
  console.log('收到请求: GET /api/categories');
  const query = 'SELECT DISTINCT category FROM articles ORDER BY category';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('查询错误:', err);
      return res.status(500).json({ error: err.message });
    }
    const categories = rows.map(row => row.category);
    res.json({ categories });
  });
});

app.get('/api/news', (req, res) => {
  console.log('收到请求: GET /api/news', req.query);
  const { category, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  
  let countQuery = 'SELECT COUNT(*) as total FROM articles';
  let dataQuery = 'SELECT * FROM articles ORDER BY published_at DESC LIMIT ? OFFSET ?';
  let params = [parseInt(limit), parseInt(offset)];
  let countParams = [];
  
  if (category) {
    countQuery = 'SELECT COUNT(*) as total FROM articles WHERE category = ?';
    dataQuery = 'SELECT * FROM articles WHERE category = ? ORDER BY published_at DESC LIMIT ? OFFSET ?';
    params = [category, parseInt(limit), parseInt(offset)];
    countParams = [category];
  }
  
  // 先查询总数
  db.get(countQuery, countParams, (err, countRow) => {
    if (err) {
      console.error('查询错误:', err);
      return res.status(500).json({ error: err.message });
    }
    
    const total = countRow.total;
    const totalPages = Math.ceil(total / limit);
    
    // 再查询数据
    db.all(dataQuery, params, (err, rows) => {
      if (err) {
        console.error('查询错误:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log(`返回第 ${page} 页，共 ${rows.length} 条新闻（总共 ${total} 条）`);
      res.json({ 
        articles: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          totalPages: totalPages
        }
      });
    });
  });
});

app.get('/api/search', (req, res) => {
  console.log('收到请求: GET /api/search', req.query);
  const { q, page = 1, limit = 20 } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Search query required' });
  }
  
  const searchTerm = `%${q}%`;
  const offset = (page - 1) * limit;
  
  const countQuery = `
    SELECT COUNT(*) as total FROM articles 
    WHERE title LIKE ? OR summary LIKE ? OR content LIKE ? OR company LIKE ? OR category LIKE ?
  `;
  
  const dataQuery = `
    SELECT * FROM articles 
    WHERE title LIKE ? OR summary LIKE ? OR content LIKE ? OR company LIKE ? OR category LIKE ?
    ORDER BY published_at DESC
    LIMIT ? OFFSET ?
  `;
  
  // 先查询总数
  db.get(countQuery, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, countRow) => {
    if (err) {
      console.error('查询错误:', err);
      return res.status(500).json({ error: err.message });
    }
    
    const total = countRow.total;
    const totalPages = Math.ceil(total / limit);
    
    // 再查询数据
    db.all(dataQuery, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit), parseInt(offset)], (err, rows) => {
      if (err) {
        console.error('查询错误:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log(`搜索 "${q}" 返回第 ${page} 页，共 ${rows.length} 条结果（总共 ${total} 条）`);
      res.json({ 
        articles: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          totalPages: totalPages
        }
      });
    });
  });
});

// 提供前端静态文件
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
