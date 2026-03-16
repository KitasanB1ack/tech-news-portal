const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database/tech-news.db');

function cleanupOldNews() {
  const db = new sqlite3.Database(DB_PATH);
  
  // 计算14天前的日期
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const cutoffDate = fourteenDaysAgo.toISOString();
  
  console.log(`🗑️  清理 ${cutoffDate} 之前的旧数据...`);
  
  db.run(
    'DELETE FROM articles WHERE published_at < ?',
    [cutoffDate],
    function(err) {
      if (err) {
        console.error('❌ 清理失败:', err);
      } else {
        console.log(`✅ 已删除 ${this.changes} 条旧数据`);
      }
      db.close();
    }
  );
}

cleanupOldNews();
