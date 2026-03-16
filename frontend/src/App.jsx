import { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = '/api'

function App() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchArticles(1) // 切换分类时重置到第一页
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/categories`)
      setCategories(response.data.categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchArticles = async (page = 1) => {
    setLoading(true)
    try {
      const params = { 
        page, 
        limit: pagination.limit 
      }
      if (selectedCategory) {
        params.category = selectedCategory
      }
      const response = await axios.get(`${API_BASE}/news`, { params })
      setArticles(response.data.articles)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      fetchArticles(1)
      return
    }
    
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE}/search`, { 
        params: { 
          q: searchQuery,
          page: 1,
          limit: pagination.limit 
        } 
      })
      setArticles(response.data.articles)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage) => {
    if (searchQuery.trim()) {
      // 搜索模式下的翻页
      setLoading(true)
      axios.get(`${API_BASE}/search`, { 
        params: { 
          q: searchQuery,
          page: newPage,
          limit: pagination.limit 
        } 
      }).then(response => {
        setArticles(response.data.articles)
        setPagination(response.data.pagination)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }).catch(error => {
        console.error('Error:', error)
      }).finally(() => {
        setLoading(false)
      })
    } else {
      // 普通浏览模式
      fetchArticles(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const Pagination = () => {
    const { page, totalPages } = pagination
    if (totalPages <= 1) return null

    const pages = []
    const maxVisible = 7
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (page >= totalPages - 3) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = page - 1; i <= page + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← 上一页
        </button>
        
        {pages.map((p, idx) => 
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">...</span>
          ) : (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                p === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {p}
            </button>
          )
        )}
        
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          下一页 →
        </button>
      </div>
    )
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  🚀 科技企业资讯门户
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  实时追踪全球大型科技企业动态与投资资讯
                </p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {darkMode ? '🌞' : '🌙'}
              </button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索新闻..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  🔍 搜索
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory(null)
                    fetchArticles(1)
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  重置
                </button>
              </div>
            </form>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Categories */}
            <aside className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📊 分类浏览
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === null
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    全部
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main Content - Articles */}
            <main className="lg:col-span-3">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
                </div>
              ) : articles.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">暂无新闻数据</p>
                </div>
              ) : (
                <>
                  {/* Results info */}
                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    共 {pagination.total} 条结果，第 {pagination.page}/{pagination.totalPages} 页
                  </div>

                  <div className="space-y-4">
                    {articles.map((article) => (
                      <article
                        key={article.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex-1">
                            {article.title}
                          </h2>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {article.company && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-medium">
                              {article.company}
                            </span>
                          )}
                          {article.category && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300">
                              {article.category}
                            </span>
                          )}
                          <span>📅 {formatDate(article.published_at)}</span>
                          {article.source && <span>🔗 {article.source}</span>}
                        </div>

                        {article.summary && (
                          <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                            {article.summary}
                          </p>
                        )}

                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            阅读全文 →
                          </a>
                        )}
                      </article>
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination />
                </>
              )}
            </main>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              © 2026 科技企业资讯门户 | Powered by OpenClaw AI
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
