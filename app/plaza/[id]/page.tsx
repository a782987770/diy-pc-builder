'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// ==================== 类型定义 ====================
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

interface BuildPart {
  partId: string
  quantity: number
  part: Part | null
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

const categoryConfig = [
  { key: 'cpu', label: 'CPU', icon: '🔲' },
  { key: 'motherboard', label: '主板', icon: '📟' },
  { key: 'memory', label: '内存', icon: '💾' },
  { key: 'storage', label: '硬盘', icon: '💿' },
  { key: 'gpu', label: '显卡', icon: '🎮' },
  { key: 'psu', label: '电源', icon: '⚡' },
  { key: 'case', label: '机箱', icon: '🖥️' },
  { key: 'cooler', label: '散热器', icon: '❄️' },
]

function formatSpecs(part: Part): string {
  const s = part.specs
  switch (part.category) {
    case 'cpu': return `${s.cores || '-'}核${s.threads || '-'}线程 · ${s.socket || ''} · ${s.boostClock || s.baseClock || '-'}GHz`
    case 'motherboard': return `${s.supportedSocket || ''} · ${s.formFactor || ''}`
    case 'memory': return `${s.capacity || '-'}GB · ${s.memoryType || ''} ${s.frequency || '-'}MHz`
    case 'storage': return `${s.capacityGB || '-'}GB · 读${s.readSpeed || '-'}MB/s`
    case 'gpu': return `${s.vram || '-'}GB显存 · TDP ${s.tdpW || '-'}W`
    case 'psu': return `${s.wattage || '-'}W · ${s.certification || ''}`
    case 'case': return `支持${s.formFactorSupport?.join('/') || ''}`
    case 'cooler': return `高度${s.height || '-'}mm`
    default: return ''
  }
}

export default function BuildDetailPage() {
  const params = useParams()
  const buildId = params.id as string

  const [build, setBuild] = useState<PCBuild | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCpsModal, setShowCpsModal] = useState<Part | null>(null)

  useEffect(() => {
    if (buildId) fetchBuild()
  }, [buildId])

  async function fetchBuild() {
    setLoading(true)
    try {
      // 获取所有方案并找到匹配的
      const res = await fetch('/api/builds?pageSize=100')
      const data = await res.json()
      if (data.success) {
        const found = data.data.builds.find((b: PCBuild) => b.id === buildId)
        if (found) setBuild(found)
      }
    } catch (err) {
      console.error('加载方案失败:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleLike() {
    if (!build) return
    try {
      await fetch(`/api/builds/${buildId}/like`, { method: 'POST' })
      setBuild(prev => prev ? { ...prev, likes: prev.likes + 1 } : null)
    } catch (err) {
      console.error('点赞失败:', err)
    }
  }

  // 加载状态
  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '16px', color: '#909399' }}>正在加载方案详情...</p>
      </div>
    )
  }

  // 未找到
  if (!build) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-icon">🖥️</div>
          <div className="empty-text">方案不存在或已被删除</div>
          <Link href="/" style={{ color: '#1890ff' }}>← 返回装配广场</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {/* 面包屑导航 */}
      <div style={{ padding: '16px 0', fontSize: '13px', color: '#909399' }}>
        <Link href="/">装配广场</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span>{build.title}</span>
      </div>

      {/* 方案详情头部 */}
      <div className="build-detail">
        <div className="build-detail-header">
          <div>
            <h1 className="build-detail-title">{build.title}</h1>
            {build.description && (
              <p style={{ color: '#606266', marginTop: '8px', fontSize: '14px' }}>{build.description}</p>
            )}
            <div className="build-tags">
              {build.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
              {build.isOfficial && <span className="tag" style={{ background: '#fff7e6', color: '#fa8c16' }}>⭐ 官方推荐</span>}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '13px', color: '#909399' }}>
              <span>👤 {build.author}</span>
              <span>📅 {new Date(build.createdAt).toLocaleDateString('zh-CN')}</span>
              <span>👁️ {build.views} 次浏览</span>
            </div>
          </div>

          <div className="build-summary">
            <div className="summary-item">
              <div className="summary-value">¥{build.totalPrice.toLocaleString()}</div>
              <div className="summary-label">总价</div>
            </div>
            <div className="summary-item">
              <div className="summary-value" style={{ color: '#fa8c16' }}>{(build.totalScore / 100).toFixed(0)}万</div>
              <div className="summary-label">综合跑分</div>
            </div>
            <div className="summary-item">
              <button
                onClick={handleLike}
                style={{
                  background: 'none', border: '2px solid #ff4d4f',
                  borderRadius: '50%', width: '48px', height: '48px',
                  fontSize: '20px', cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fff1f0'; e.currentTarget.style.transform = 'scale(1.1)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}
              >
                ❤️
              </button>
              <div className="summary-label">{build.likes} 赞</div>
            </div>
          </div>
        </div>

        {/* 配件清单表格 */}
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', marginTop: '24px' }}>
          📋 配件清单 ({build.parts.length}个配件)
        </h2>
        <table className="parts-table">
          <thead>
            <tr>
              <th>分类</th>
              <th>配件名称</th>
              <th>规格参数</th>
              <th>价格</th>
              <th>购买链接</th>
            </tr>
          </thead>
          <tbody>
            {build.parts.map(bp => {
              if (!bp.part) return null
              const p = bp.part
              const catInfo = categoryConfig.find(c => c.key === p.category)
              return (
                <tr key={bp.partId}>
                  <td>
                    <span className={`category-icon cat-${p.category}`}>
                      {catInfo?.icon || '📦'}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>{catInfo?.label || p.category}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <span className="part-brand">{p.brand}</span>
                  </td>
                  <td><span style={{ fontSize: '12px', color: '#909399' }}>{formatSpecs(p)}</span></td>
                  <td style={{ color: '#ff4d4f', fontWeight: 700 }}>¥{p.price.toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => setShowCpsModal(p)}
                      className="btn-buy"
                      style={{ fontSize: '12px', padding: '5px 14px' }}
                    >
                      🔗 去购买
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* 总计行 */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: '20px', paddingTop: '16px', borderTop: '2px solid #f5f7fa',
        }}>
          <div>
            <Link href="/diy" className="sort-btn" style={{ marginRight: '10px' }}>
              🔧 基于此方案DIY修改
            </Link>
            <Link href="/" className="sort-btn">
              ← 返回广场
            </Link>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '14px', color: '#909399', marginRight: '8px' }}>预估总价：</span>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#ff4d4f' }}>¥{build.totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

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
              maxWidth: '520px', width: '90%',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>🛒 购买：{showCpsModal.name}</h3>
            <p style={{ color: '#909399', fontSize: '13px', marginBottom: '20px' }}>
              通过本站链接前往第三方平台下单可获得佣金返利
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
                  佣金 {(link.commissionRate * 100).toFixed(1)}% → 预估佣金 ¥{(link.priceAtPlatform * link.commissionRate).toFixed(0)}
                </div>
              </a>
            ))}
            <button
              onClick={() => setShowCpsModal(null)}
              style={{ width: '100%', marginTop: '8px', padding: '10px', background: '#f5f7fa', borderRadius: '8px', color: '#606266', fontSize: '14px' }}
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
