const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: '/root/.openclaw/.env' });

const dbPath = path.join(__dirname, '../../database/tech-news.db');
const db = new sqlite3.Database(dbPath);

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

// Companies to track
const COMPANIES = [
  { name: 'NVIDIA', query: 'NVIDIA 英伟达 latest news', category: 'AI芯片' },
  { name: 'Tesla', query: 'Tesla 特斯拉 latest news', category: '电动汽车' },
  { name: 'Apple', query: 'Apple 苹果 latest news', category: '消费电子' },
  { name: 'Microsoft', query: 'Microsoft 微软 latest news', category: '云计算' },
  { name: 'Meta', query: 'Meta Facebook latest news', category: '社交媒体' },
  { name: 'Amazon', query: 'Amazon 亚马逊 latest news', category: '电商云计算' },
  { name: 'Google', query: 'Google Alphabet latest news', category: '搜索广告' },
  { name: 'OpenAI', query: 'OpenAI latest news AI', category: 'AI研究' },
  { name: 'Alibaba', query: '阿里巴巴 latest news', category: '电商云计算' },
  { name: 'Tencent', query: '腾讯 latest news', category: '社交游戏' },
];

async function searchNews(query) {
  try {
    const response = await axios.post(
      'https://api.tavily.com/search',
      {
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: false,
        include_raw_content: false
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.results || [];
  } catch (error) {
    console.error(`❌ Error searching for "${query}":`, error.message);
    return [];
  }
}

async function insertArticle(article, company, category) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO articles 
      (title, content, summary, url, source, category, company, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const publishedAt = new Date().toISOString();
    
    stmt.run(
      article.title,
      article.content || '',
      article.content?.substring(0, 300) || '',
      article.url,
      article.url ? new URL(article.url).hostname : 'unknown',
      category,
      company,
      publishedAt,
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      }
    );
    
    stmt.finalize();
  });
}

async function fetchAllNews() {
  console.log('🔍 Starting news fetch...\n');
  
  let totalAdded = 0;
  
  for (const company of COMPANIES) {
    console.log(`📰 Fetching news for ${company.name}...`);
    
    const results = await searchNews(company.query);
    
    for (const article of results) {
      try {
        const changes = await insertArticle(article, company.name, company.category);
        if (changes > 0) {
          console.log(`  ✅ Added: ${article.title.substring(0, 60)}...`);
          totalAdded++;
        }
      } catch (error) {
        // Ignore duplicate errors
        if (!error.message.includes('UNIQUE constraint')) {
          console.error(`  ❌ Error inserting article:`, error.message);
        }
      }
    }
    
    // Rate limiting: wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n✅ Fetch complete! Added ${totalAdded} new articles.`);
  db.close();
}

fetchAllNews().catch(error => {
  console.error('❌ Fatal error:', error);
  db.close();
  process.exit(1);
});
