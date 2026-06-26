'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
  popularity: number
}

const categories = [
  { key: 'all', label: '全部', icon: '📦' },
  { key: 'cpu', label: 'CPU', icon: '🔲' },
  { key: 'motherboard', label: '主板', icon: '📟' },
  { key: 'memory', label: '内存', icon: '💾' },
  { key: 'storage', label: '硬盘', icon: '💿' },
  { key: 'gpu', label: '显卡', icon: '🎮' },
  { key: 'psu', label: '电源', icon: '⚡' },
  { key: 'case', label: '机箱', icon: '🖥️' },
  { key: 'cooler', label: '散热器', icon: '❄️' },
]

const categoryNames: Record<string, string> = {
  cpu: 'CPU', motherboard: '主板', memory: '内存',
  storage: '硬盘', gpu: '显卡', psu: '电源',
  case: '机箱', cooler: '散热器',
}

function formatSpecs(part: Part): string {
  const s = part.specs
  switch (part.category) {
    case 'cpu':
      return `${s.cores || '-'}核${s.threads || '-'}线程 · ${s.socket || ''} · ${s.boostClock || s.baseClock || '-'}GHz`
    case 'motherboard':
      return `${s.supportedSocket || ''} · ${s.formFactor || ''} · DDR${s.supportedMemoryType?.replace('DDR', '') || ''}`
    case 'memory':
      return `${s.capacity || '-'}GB · ${s.memoryType || ''} ${s.frequency || '-}MHz`
    case 'storage':
      return `${s.capacityGB || '-'}GB ${s.storageType?.replace('_', '/') || ''} · 读${s.readSpeed || '-'}MB/s`
    case 'gpu':
      return `${s.vram || '-'}GB显存 · TDP ${s.tdpW || '-'}W`
    case 'psu':
      return `${s.wattage || '-'}W · ${s.certification || ''}`
    case 'case':
      return `支持${s.formFactorSupport?.join('/') || ''} · 显卡限长${s.maxGpuLength || '-'}mm`
    case 'cooler':
      return `高度${s.height || '-'}mm · 支持TDP ${s.tdpSupport || '-'}W`
    default:
      return ''
  }
}

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCpsModal, setShowCpsModal] = useState<Part | null>(null)

  useEffect(() => {
    fetchParts()
  }, [activeCategory, searchQuery])

  async function fetchParts() {
    setLoading(true)
    try {
      let url = `/api/parts?pageSize=100`
      if (activeCategory !== 'all') url += `&category=${activeCategory}`
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        // 按热度排序
        setParts(data.data.sort((a: Part, b: Part) => b.popularity - a.popularity))
      }
    } catch (err) {
      console.error('加载配件失败:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleBuyClick(e: React.MouseEvent, part: Part) {
    e.stopPropagation()
    setShowCpsModal(part)
  }

  return (
    <div className="container">
      {/* 页面头部 */}
      <div className="page-header">
        <h1 className="page-title">📦 配件库</h1>
        <p className="page-subtitle">浏览所有可用配件，点击购买跳转至第三方平台（含CPS佣金）</p>
      </div>

      {/* 搜索框 */}
      <div style={{ marginBottom: '16px', maxWidth: '480px' }}>
        <input
          type="text"
          placeholder="🔍 搜索配件名称或品牌..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '10px 16px', fontSize: '14px', borderRadius: '24px' }}
        />
      </div>

      {/* 分类标签 */}
      <div className="sort-bar">
        {categories.map(cat => (
          <button
            key={cat.key}
            className={`sort-btn ${activeCategory === cat.key ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* 加载状态 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '16px', color: '#909399' }}>正在加载配件...</p>
        </div>
      )}

      {/* 配件网格 */}
      {!loading && parts.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div className="empty-text">暂无配件数据</div>
          <div className="empty-hint">试试其他分类或搜索关键词</div>
        </div>
      )}

      {!loading && parts.length > 0 && (
        <div className="grid-4">
          {parts.map((part) => (
            <div key={part.id} className="part-card">
              <div className="part-header">
                <span className="part-name">{part.name}</span>
                <span className="part-brand">{part.brand}</span>
              </div>

              <div style={{
                fontSize: '12px', color: '#1890ff', fontWeight: 600,
                marginBottom: '6px'
              }}>
                🏷️ {categoryNames[part.category] || part.category}
              </div>

              <div className="part-specs">{formatSpecs(part)}</div>

              <div className="part-footer">
                <div className="part-price">¥{part.price.toLocaleString()}</div>
                <button
                  className="btn-buy"
                  onClick={(e) => handleBuyClick(e, part)}
                  style={{ fontSize: '12px', padding: '5px 14px' }}
                >
                  🔗 购买 ({Math.max(...part.cpsLinks.map(c => c.commissionRate)) * 100}%佣金)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CPS购买弹窗 */}
      {showCpsModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 999,
          }}
          onClick={() => setShowCpsModal(null)}
        >
          <div
            style={{
              background: '#fff', borderRadius: '12px', padding: '28px',
              maxWidth: '520px', width: '90%', maxHeight: '80vh', overflow: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>
              🛒 购买：{showCpsModal.name}
            </h3>
            <p style={{ color: '#909399', fontSize: '13px', marginBottom: '20px' }}>
              点击下方链接前往第三方平台购买，通过本站链接下单可获得{Math.max(...showCpsModal.cpsLinks.map(c => c.commissionRate)) * 100}%返佣
            </p>

            {showCpsModal.cpsLinks.map(link => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', padding: '14px 18px', marginBottom: '10px',
                  border: '1px solid #dcdfe6', borderRadius: '8px',
                  textDecoration: 'none !important',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1890ff'
                  e.currentTarget.style.background = '#e6f7ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#dcdfe6'
                  e.currentTarget.style.background = '#fff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>
                    {link.platform === 'jd' ? '🟢 京东' : link.platform === 'taobao' ? '🟠 淘宝' : '🔴 拼多多'}
                  </span>
                  <span style={{ color: '#ff4d4f', fontWeight: 700, fontSize: '17px' }}>
                    ¥{link.priceAtPlatform.toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#909399', marginTop: '4px' }}>
                  佣金比例 {(link.commissionRate * 100).toFixed(1)}% → 预估佣金 ¥{(link.priceAtPlatform * link.commissionRate).toFixed(0)}
                </div>
              </a>
            ))}

            <button
              onClick={() => setShowCpsModal(null)}
              style={{
                width: '100%', marginTop: '8px', padding: '10px',
                background: '#f5f7fa', borderRadius: '8px',
                color: '#606266', fontSize: '14px',
              }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
