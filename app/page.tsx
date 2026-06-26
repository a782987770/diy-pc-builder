'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import buildsData from '@/data/builds.json'
import partsData from '@/data/parts.json'

// ==================== 类型定义 ====================
interface BuildPart {
  partId: string
  quantity: number
}

interface PCBuild {
  id: string
  title: string
  description?: string
  author: string
  parts: BuildPart[]
  totalPrice: number
  totalScore: number
  likes: number
  views: number
  tags: string[]
  isOfficial: boolean
  status: string
  createdAt: string
}

interface Part {
  id: string
  name: string
  brand: string
  category: string
  price: number
  image?: string
  specs: Record<string, any>
  cpsLinks: Array<{ platform: string; url: string; commissionRate: number; priceAtPlatform: number }>
  score?: number
}

// ==================== 分类图标映射 ====================
const categoryIcons: Record<string, string> = {
  cpu: '🔲',
  motherboard: '📟',
  memory: '💾',
  storage: '💿',
  gpu: '🎮',
  psu: '⚡',
  case: '🖥️',
  cooler: '❄️',
}

const categoryNames: Record<string, string> = {
  cpu: 'CPU',
  motherboard: '主板',
  memory: '内存',
  storage: '硬盘',
  gpu: '显卡',
  psu: '电源',
  case: '机箱',
  cooler: '散热器',
}

// ==================== 排序选项 ====================
const sortOptions = [
  { key: 'hot', label: '热门' },
  { key: 'newest', label: '最新' },
  { key: 'price_asc', label: '价格从低到高' },
  { key: 'price_desc', label: '价格从高到低' },
  { key: 'likes', label: '点赞最多' },
]

export default function PlazaPage() {
  const [builds, setBuilds] = useState<PCBuild[]>([])
  const [partsMap, setPartsMap] = useState<Record<string, Part>>({})
  const [loading, setLoading] = useState(true)
  const [activeSort, setActiveSort] = useState('hot')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // 从静态JSON加载数据（GitHub Pages 静态导出兼容）
  useEffect(() => {
    try {
      // 加载装机方案
      const allBuilds = buildsData as PCBuild[]
      setTotal(allBuilds.length)
      setTotalPages(Math.ceil(allBuilds.length / 12) || 1)

      // 加载配件映射
      const map: Record<string, Part> = {}
      ;(partsData as Part[]).forEach((p: Part) => { map[p.id] = p })
      setPartsMap(map)

      // 应用排序和分页
      applySortAndPage(allBuilds, activeSort, page)
    } catch (err) {
      console.error('加载数据失败:', err)
    } finally {
      setLoading(false)
    }
  }, [activeSort, page])

  function applySortAndPage(allBuilds: PCBuild[], sort: string, pageNum: number) {
    let sorted = [...allBuilds]
    switch (sort) {
      case 'hot':
        sorted.sort((a, b) => b.views - a.views)
        break
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'price_asc':
        sorted.sort((a, b) => a.totalPrice - b.totalPrice)
        break
      case 'price_desc':
        sorted.sort((a, b) => b.totalPrice - a.totalPrice)
        break
      case 'likes':
        sorted.sort((a, b) => b.likes - a.likes)
        break
    }
    const pageSize = 12
    const start = (pageNum - 1) * pageSize
    setBuilds(sorted.slice(start, start + pageSize))
  }

  // 点赞（本地状态更新）
  function handleLike(buildId: string) {
    setBuilds(prev =>
      prev.map(b => b.id === buildId ? { ...b, likes: b.likes + 1 } : b)
    )
  }

  return (
    <div className="container">
      {/* 页面头部 */}
      <div className="page-header">
        <h1 className="page-title">🖥️ 装配广场</h1>
        <p className="page-subtitle">浏览用户分享的装机方案，获取灵感打造你的专属电脑</p>
      </div>

      {/* 排序栏 */}
      <div className="sort-bar">
        {sortOptions.map(opt => (
          <button
            key={opt.key}
            className={`sort-btn ${activeSort === opt.key ? 'active' : ''}`}
            onClick={() => { setActiveSort(opt.key); setPage(1) }}
          >
            {opt.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#909399' }}>
          共 {total} 套方案
        </span>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '16px', color: '#909399' }}>正在加载装机方案...</p>
        </div>
      )}

      {/* 方案网格 */}
      {!loading && builds.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🖥️</div>
          <div className="empty-text">暂无装机方案</div>
          <div className="empty-hint">快来分享你的第一套配置吧！</div>
        </div>
      )}

      {!loading && builds.length > 0 && (
        <>
          <div className="grid-3">
            {builds.map((build) => {
              // 获取配件列表用于展示
              const buildParts = build.parts.map(bp => partsMap[bp.partId]).filter(Boolean) as Part[]
              const partCount = build.parts.length

              return (
                <Link href={`/plaza/${build.id}`} key={build.id} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ cursor: 'pointer' }}>
                    {/* 卡片封面图 */}
                    <div className="card-img-wrapper"
                      style={{
                        background: build.isOfficial
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : `linear-gradient(${Math.random() * 360}deg, ${['#667eea','#f093fb','#4facfe','#43e97b','#fa709a'][build.id.charCodeAt(3) % 5]} 0%, ${['#764ba2','#f5576c','#00f2fe','#38f9d7','#fee140'][build.id.charCodeAt(5) % 5]} 100%)`
                      }}
                    >
                      <span className="card-img-placeholder">🖥️</span>
                      {build.isOfficial && (
                        <span style={{
                          position: 'absolute', top: '10px', right: '10px',
                          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                          color: '#fff', padding: '3px 10px', borderRadius: '12px',
                          fontSize: '11px', fontWeight: 600
                        }}>官方推荐</span>
                      )}
                      <span style={{
                        position: 'absolute', bottom: '10px', left: '10px',
                        background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)',
                        color: '#fff', padding: '3px 10px', borderRadius: '10px',
                        fontSize: '12px'
                      }}>{partCount}个配件</span>
                    </div>

                    {/* 卡片内容 */}
                    <div className="card-body">
                      <h3 className="card-title">{build.title}</h3>
                      <div className="card-meta">
                        <span>{build.author}</span>
                        <span>{new Date(build.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>

                      {/* 配件预览 */}
                      <div style={{ marginBottom: '10px' }}>
                        {buildParts.slice(0, 4).map(p => (
                          <span key={p.id}
                            style={{
                              display: 'inline-block', fontSize: '11px',
                              color: '#606266', marginRight: '6px', marginBottom: '4px',
                              maxWidth: '120px', overflow: 'hidden',
                              textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}
                            title={p.name}
                          >
                            {categoryIcons[p.category]} {p.brand}
                          </span>
                        ))}
                        {buildParts.length > 4 && (
                          <span style={{ fontSize: '11px', color: '#909399' }}>
                            +{buildParts.length - 4}
                          </span>
                        )}
                      </div>

                      {/* 底部：价格 + 统计 */}
                      <div className="card-price-row">
                        <div className="card-price">
                          <span className="card-price-symbol">¥</span>
                          {build.totalPrice.toLocaleString()}
                        </div>
                        <div className="card-stats">
                          <span>❤️ {build.likes}</span>
                          <span>👁️ {build.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{ opacity: page <= 1 ? 0.4 : 1 }}
              >
                ‹ 上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="page-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{ opacity: page >= totalPages ? 0.4 : 1 }}
              >
                下一页 ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
