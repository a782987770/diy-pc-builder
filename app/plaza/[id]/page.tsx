'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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

// ==================== 分类图标和名称 ====================
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

export default function BuildDetailPage() {
  const params = useParams()
  const [build, setBuild] = useState<PCBuild | null>(null)
  const [buildParts, setBuildParts] = useState<Array<Part & { quantity: number }>>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const buildId = params.id as string

  useEffect(() => {
    try {
      const allBuilds = buildsData as PCBuild[]
      const found = allBuilds.find(b => b.id === buildId)

      if (!found) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const partsMap: Record<string, Part> = {}
      ;(partsData as Part[]).forEach((p: Part) => { partsMap[p.id] = p })

      const resolvedParts = found.parts.map(bp => ({
        ...partsMap[bp.partId],
        quantity: bp.quantity,
      })).filter(p => p.id)

      setBuild(found)
      setBuildParts(resolvedParts)

      // 模拟浏览量+1（本地）
      found.views += 1
    } catch (err) {
      console.error('加载方案详情失败:', err)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }, [buildId])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div className="loading-spinner" />
        <p style={{ marginTop: '16px', color: '#909399' }}>正在加载装机方案详情...</p>
      </div>
    )
  }

  if (notFound || !build) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div className="empty-icon">🔍</div>
        <h2 className="empty-text">未找到该装机方案</h2>
        <p className="empty-hint">该方案可能已被删除或链接有误</p>
        <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px' }}>
          返回装配广场
        </Link>
      </div>
    )
  }

  return (
    <div className="container">
      {/* 面包屑导航 */}
      <nav style={{ marginBottom: '24px', fontSize: '14px', color: '#909399' }}>
        <Link href="/" style={{ color: '#409EFF', textDecoration: 'none' }}>装配广场</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span>{build.title}</span>
      </nav>

      {/* 方案头部 */}
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '8px' }}>{build.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ color: '#606266', fontSize: '14px' }}>作者：{build.author}</span>
              <span style={{ color: '#C0C4CC' }}>|</span>
              <span style={{ color: '#909399', fontSize: '13px' }}>
                {new Date(build.createdAt).toLocaleDateString('zh-CN')}
              </span>
              {build.isOfficial && (
                <span style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff', padding: '2px 10px', borderRadius: '10px',
                  fontSize: '11px', fontWeight: 600,
                }}>官方推荐</span>
              )}
              {build.tags.map(tag => (
                <span key={tag} style={{
                  background: '#f0f2f5', color: '#606266',
                  padding: '2px 10px', borderRadius: '10px', fontSize: '12px',
                }}>#{tag}</span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="card-price">
              <span className="card-price-symbol">¥</span>
              {build.totalPrice.toLocaleString()}
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '16px', justifyContent: 'flex-end', fontSize: '13px', color: '#909399' }}>
              <span>❤️ {build.likes}</span>
              <span>👁️ {build.views}</span>
            </div>
          </div>
        </div>

        {build.description && (
          <p style={{ marginTop: '16px', color: '#606266', lineHeight: '1.7', fontSize: '15px' }}>
            {build.description}
          </p>
        )}
      </div>

      {/* 配件清单 */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#303133' }}>
          📋 配件清单 ({buildParts.length} 个配件)
        </h2>

        <div style={{ border: '1px solid #EBEEF5', borderRadius: '12px', overflow: 'hidden' }}>
          {/* 表头 */}
          <div style={{
            display: 'grid', gridTemplateColumns: '36px 1fr 120px 120px 140px',
            padding: '14px 20px', background: '#f5f7fa',
            borderBottom: '1px solid #EBEEF5', fontSize: '13px',
            fontWeight: 600, color: '#909399',
          }}>
            <span>#</span>
            <span>配件名称</span>
            <span>分类</span>
            <span>单价</span>
            <span>购买链接</span>
          </div>

          {/* 配件列表 */}
          {buildParts.map((part, index) => (
            <div key={part.id} style={{
              display: 'grid', gridTemplateColumns: '36px 1fr 120px 120px 140px',
              padding: '16px 20px', alignItems: 'center',
              borderBottom: index < buildParts.length - 1 ? '1px solid #f0f2f5' : 'none',
              transition: 'background 0.2s',
            }}>
              <span style={{ color: '#C0C4CC', fontSize: '14px' }}>{index + 1}</span>
              <div>
                <div style={{ fontWeight: 500, color: '#303133', fontSize: '14px' }}>
                  {categoryIcons[part.category]} {part.name}
                </div>
                <div style={{ fontSize: '12px', color: '#909399', marginTop: '2px' }}>
                  {part.brand} {part.quantity > 1 ? `× ${part.quantity}` : ''}
                </div>
              </div>
              <span style={{ fontSize: '13px', color: '#606266' }}>
                {categoryNames[part.category]}
              </span>
              <span style={{ fontWeight: 600, color: '#F56C6C', fontSize: '14px' }}>
                ¥{part.price.toLocaleString()}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {part.cpsLinks?.slice(0, 2).map(link => (
                  <a key={link.platform} href={link.url}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
                      textDecoration: 'none', whiteSpace: 'nowrap',
                      background: link.platform === 'jd' ? '#e74c3c15' : '#ff6a0015',
                      color: link.platform === 'jd' ? '#e74c3c' : '#ff6a00',
                      border: `1px solid ${link.platform === 'jd' ? '#e74c3c30' : '#ff6a0030'}`,
                    }}
                  >
                    {link.platform === 'jd' ? '京东' : link.platform === 'taobao' ? '淘宝' : link.platform}
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* 合计行 */}
          <div style={{
            display: 'grid', gridTemplateColumns: '36px 1fr 120px 120px 140px',
            padding: '16px 20px', background: '#fafbfc',
            alignItems: 'center', fontWeight: 600,
          }}>
            <span></span>
            <span style={{ color: '#303133', fontSize: '14px' }}>合计</span>
            <span></span>
            <span style={{ color: '#F56C6C', fontSize: '16px' }}>¥{build.totalPrice.toLocaleString()}</span>
            <span></span>
          </div>
        </div>
      </section>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '48px', flexWrap: 'wrap' }}>
        <Link href="/diy"
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
        >
          🔧 基于此配置 DIY 改装
        </Link>
        <Link href="/parts"
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
        >
          🛒 浏览配件列表
        </Link>
        <Link href="/"
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
        >
          ← 返回广场
        </Link>
      </div>
    </div>
  )
}
