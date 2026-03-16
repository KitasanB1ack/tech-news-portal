#!/bin/bash
cd /root/.openclaw/workspace/tech-news-site/backend

echo "🌅 $(date) - 开始每日新闻更新任务"

# 1. 抓取最新新闻
echo "📰 抓取最新科技资讯..."
node scripts/fetch-news.js

# 2. 清理旧数据
echo "🗑️  清理14天前的旧数据..."
node scripts/cleanup-old-news.js

echo "✅ $(date) - 每日更新任务完成"
