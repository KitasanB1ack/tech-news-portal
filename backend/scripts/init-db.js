const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database/tech-news.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Initializing database...');

db.serialize(() => {
  // Create articles table
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      summary TEXT,
      url TEXT UNIQUE,
      source TEXT,
      author TEXT,
      category TEXT,
      company TEXT,
      published_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      image_url TEXT
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating articles table:', err);
    } else {
      console.log('✅ Articles table created/verified');
    }
  });

  // Create indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_category ON articles(category)');
  db.run('CREATE INDEX IF NOT EXISTS idx_company ON articles(company)');
  db.run('CREATE INDEX IF NOT EXISTS idx_published_at ON articles(published_at DESC)');
  
  console.log('✅ Database initialization complete');
});

db.close();
