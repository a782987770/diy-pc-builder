'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

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

interface SelectedPart {
  partId: string
  part: Part
  quantity: number
}

interface CompatResult {
  isCompatible: boolean
  issues: Array<{ severity: string; message: string }>
  estimatedPower: number
  totalScore: number
}

const categoryOrder = ['cpu', 'motherboard', 'memory', 'storage', 'gpu', 'psu', 'case', 'cooler']

const categoryConfig = [
  { key: 'cpu', label: 'CPU 处理器', icon: '🔲', required: true },
  { key: 'motherboard', label: '主板', icon: '📟', required: true },
  { key: 'memory', label: '内存', icon: '💾', required: true },
  { key: 'storage', label: '硬盘', icon: '💿', required: true },
  { key: 'gpu', label: '显卡', icon: '🎮', required: false },
  { key: 'psu', label: '电源', icon: '⚡', required: true },
  { key: 'case', label: '机箱', icon: '🖥️', required: true },
  { key: 'cooler', label: '散热器', icon: '❄️', required: false },
]

function formatSpecs(part: Part): string {
  const s = part.specs
  switch (part.category) {
    case 'cpu': return `${s.cores || '-'}核${s.threads || '-'}线程 · ${s.socket || ''} · ${s.boostClock || s.baseClock || '-'}GHz`
    case 'motherboard': return `${s.supportedSocket || ''} · ${s.formFactor || ''}`
    case 'memory': return `${s.capacity || '-'}GB · ${s.memoryType || ''} ${s.frequency || '-'}MHz`
    case 'storage': return `${s.capacityGB || '-'}GB ${s.storageType?.replace('_', '/') || ''} · 读${s.readSpeed || '-'}MB/s`
    case 'gpu': return `${s.vram || '-'}GB显存 · TDP ${s.tdpW || '-'}W`
    case 'psu': return `${s.wattage || '-'}W · ${s.certification || ''}`
    case 'case': return `支持${s.formFactorSupport?.join('/') || ''}`
    case 'cooler': return `高度${s.height || '-'}mm · TDP ${s.tdpSupport || '-'}W`
    default: return ''
  }
}

export default function DIYPage() {
  const [parts, setParts] = useState<Part[]>([])
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('cpu')
  const [showPicker, setShowPicker] = useState(false)
  const [compatResult, setCompatResult] = useState<CompatResult | null>(null)
  const [buildTitle, setBuildTitle] = useState('我的装机方案')
  const [checkingCompat, setCheckingCompat] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)

  // 加载配件库
  useEffect(() => {
    fetchParts()
  }, [])

  async function fetchParts() {
    setLoading(true)
    try {
      const res = await fetch('/api/parts?pageSize=200')
      const data = await res.json()
      if (data.success) setParts(data.data)
    } catch (err) {
      console.error('加载配件失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 选择配件
  function selectPart(part: Part) {
    const existingIdx = selectedParts.findIndex(sp => sp.part.category === part.category)
    if (existingIdx >= 0) {
      const updated = [...selectedParts]
      updated[existingIdx] = { partId: part.id, part, quantity: 1 }
      setSelectedParts(updated)
    } else {
      setSelectedParts([...selectedParts, { partId: part.id, part, quantity: 1 }])
    }
    setShowPicker(false)
    setCompatResult(null) // 清除旧的兼容性结果
  }

  // 移除配件
  function removePart(category: string) {
    setSelectedParts(selectedParts.filter(sp => sp.part.category !== category))
    setCompatResult(null)
  }

  // 兼容性检查
  async function checkCompatibility() {
    setCheckingCompat(true)
    try {
      const body = selectedParts.map(sp => ({ partId: sp.partId, quantity: sp.quantity }))
      const res = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parts: body }),
      })
      const data = await res.json()
      if (data.success) setCompatResult(data.data)
    } catch (err) {
      console.error('兼容性检查失败:', err)
    } finally {
      setCheckingCompat(false)
    }
  }

  // 计算总价
  const totalPrice = selectedParts.reduce((sum, sp) => sum + sp.part.price * sp.quantity, 0)

  // 获取当前分类的可用配件（排除已选的）
  const availablePartsForCategory = parts.filter(p => p.category === activeCategory)

  // 获取已选的分类列表
  const selectedCategories = new Set(selectedParts.map(sp => sp.part.category))

  return (
    <div className="container">
      {/* 页面头部 */}
      <div className="page-header">
        <h1 className="page-title">🔧 DIY装配</h1>
        <p className="page-subtitle">选择配件，自动检查兼容性，打造你的专属电脑</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* 左侧：配置单 */}
        <div>
          {/* 标题输入 */}
          <div className="build-detail" style={{ padding: '20px 24px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <input
                type="text"
                value={buildTitle}
                onChange={e => setBuildTitle(e.target.value)}
                placeholder="给你的配置起个名字..."
                style={{
                  flex: 1, fontSize: '20px', fontWeight: 700,
                  border: 'none', background: 'transparent',
                  padding: '8px 0', borderBottom: '2px solid #e6f7ff',
                  borderRadius: 0,
                }}
              />
              <button
                onClick={() => setShowSaveModal(true)}
                className="btn-buy"
                style={{ fontSize: '14px', padding: '8px 20px', whiteSpace: 'nowrap' }}
              >
                💾 保存方案
              </button>
            </div>

            {/* 配件表格 */}
            <table className="parts-table">
              <thead>
                <tr>
                  <th>分类</th>
                  <th>配件名称</th>
                  <th>规格参数</th>
                  <th>价格</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {categoryConfig.map(cat => {
                  const selected = selectedParts.find(sp => sp.part.category === cat.key)
                  return (
                    <tr key={cat.key}>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span className={`category-icon cat-${cat.key}`}>{cat.icon}</span>
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>{cat.label}</span>
                        </span>
                      </td>
                      {selected ? (
                        <>
                          <td>
                            <span style={{ fontWeight: 500 }}>{selected.part.name}</span>
                            <span className="part-brand" style={{ marginLeft: '6px' }}>{selected.part.brand}</span>
                          </td>
                          <td><span style={{ fontSize: '12px', color: '#909399' }}>{formatSpecs(selected.part)}</span></td>
                          <td style={{ color: '#ff4d4f', fontWeight: 700 }}>¥{selected.part.price.toLocaleString()}</td>
                          <td>
                            <button
                              onClick={() => removePart(cat.key)}
                              style={{
                                color: '#ff4d4f', background: '#fff1f0',
                                border: '1px solid #ffa39e', borderRadius: '4px',
                                padding: '4px 10px', fontSize: '12px',
                              }}
                            >
                              移除
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td colSpan={3}>
                            <span style={{ color: '#c0c4cc', fontSize: '13px' }}>
                              {cat.required ? '未选择（必填）' : '未选择（可选）'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => { setActiveCategory(cat.key); setShowPicker(true) }}
                              className="sort-btn"
                              style={{ fontSize: '12px', padding: '4px 12px' }}
                            >
                              选择
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* 总价栏 */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: '20px', paddingTop: '16px', borderTop: '2px solid #f5f7fa',
            }}>
              <div>
                <span style={{ fontSize: '14px', color: '#909399' }}>共 {selectedParts.length} 个配件</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '14px', color: '#909399', marginRight: '8px' }}>预估总价：</span>
                <span style={{ fontSize: '28px', fontWeight: 700, color: '#ff4d4f' }}>¥{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <button
                onClick={checkCompatibility}
                disabled={checkingCompat || selectedParts.length === 0}
                className="btn-buy"
                style={{
                  flex: 1, justifyContent: 'center',
                  opacity: checkingCompat ? 0.6 : 1,
                  background: checkingCompat ? '#d9d9d9' : undefined,
                }}
              >
                {checkingCompat ? '⏳ 检查中...' : '🔍 兼容性检查'}
              </button>
              {selectedParts.length > 0 && (
                <Link href="/parts" className="btn-buy" style={{ textDecoration: 'none !important' }}>
                  📦 浏览配件库
                </Link>
              )}
            </div>
          </div>

          {/* 兼容性检查结果 */}
          {compatResult && (
            <div className={`compat-result compat-${compatResult.isCompatible ? 'ok' : compatResult.issues.some(i => i.severity === 'error') ? 'error' : 'warning'}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>
                  {compatResult.isCompatible ? '✅' : '⚠️'}
                </span>
                <span style={{ fontSize: '17px', fontWeight: 700 }}>
                  {compatResult.isCompatible ? '兼容性通过！' : '存在兼容性问题'}
                </span>
              </div>

              {/* 统计信息 */}
              <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '13px', color: '#909399' }}>预估功耗：</span>
                  <strong>{compatResult.estimatedPower}W</strong>
                </div>
                <div>
                  <span style={{ fontSize: '13px', color: '#909399' }}>综合跑分：</span>
                  <strong style={{ color: '#fa8c16' }}>{compatResult.totalScore.toLocaleString()}</strong>
                </div>
              </div>

              {/* 问题列表 */}
              {compatResult.issues.length > 0 && (
                <ul style={{ paddingLeft: '18px', margin: 0 }}>
                  {compatResult.issues.map((issue, idx) => (
                    <li key={idx} style={{ fontSize: '13px', lineHeight: '1.8' }}>
                      <strong>[{issue.severity === 'error' ? '错误' : issue.severity === 'warning' ? '警告' : '提示'}]</strong>{' '}
                      {issue.message}
                    </li>
                  ))}
                </ul>
              )}

              {compatResult.issues.length === 0 && compatResult.isCompatible && (
                <p style={{ fontSize: '13px', margin: 0 }}>🎉 所有配件均匹配，可以放心装机！</p>
              )}
            </div>
          )}
        </div>

        {/* 右侧：配件选择器 */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '80px' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #f0f0f0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>📦 选择配件</h3>
              <p style={{ fontSize: '12px', color: '#909399', marginTop: '4px' }}>
                点击分类标签浏览并选择配件
              </p>
            </div>

            {/* 分类快捷选择 */}
            <div style={{ padding: '12px 18px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderBottom: '1px solid #f0f0f0' }}>
              {categoryConfig.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => { setActiveCategory(cat.key); setShowPicker(true) }}
                  className={`sort-btn ${activeCategory === cat.key ? 'active' : ''}`}
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  {cat.icon} {cat.label}
                  {selectedCategories.has(cat.key) && ' ✓'}
                </button>
              ))}
            </div>

            {/* 配件列表预览 */}
            <div style={{ padding: '12px 18px', maxHeight: '400px', overflow: 'auto' }}>
              {!showPicker ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#c0c4cc' }}>
                  <div style={{ fontSize: '36px', marginBottom: '8px' }}>👆</div>
                  <p style={{ fontSize: '13px' }}>点击上方分类开始选配</p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: '#606266' }}>
                    {categoryConfig.find(c => c.key === activeCategory)?.icon}{' '}
                    {categoryConfig.find(c => c.key === activeCategory)?.label}
                  </div>
                  {availablePartsForCategory.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#c0c4cc', textAlign: 'center', padding: '20px 0' }}>
                      该分类暂无配件数据
                    </p>
                  ) : (
                    availablePartsForCategory.slice(0, 15).map(part => (
                      <div
                        key={part.id}
                        onClick={() => selectPart(part)}
                        className="part-card"
                        style={{ marginBottom: '8px', cursor: 'pointer', padding: '12px' }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                          {part.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#909399', marginBottom: '6px' }}>
                          {formatSpecs(part)}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#ff4d4f', fontWeight: 700, fontSize: '15px' }}>
                            ¥{part.price.toLocaleString()}
                          </span>
                          <span style={{ fontSize: '11px', color: '#52c41a' }}>
                            点击选择 →
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 保存方案弹窗 */}
      {showSaveModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 999,
          }}
          onClick={() => setShowSaveModal(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: '12px', padding: '28px',
              maxWidth: '480px', width: '90%',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>💾 保存装机方案</h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>方案名称</label>
              <input
                type="text"
                value={buildTitle}
                onChange={e => setBuildTitle(e.target.value)}
                placeholder="给方案起个名字..."
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ background: '#f5f7fa', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#606266', marginBottom: '6px' }}>
                方案概览：{selectedParts.length} 个配件
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#ff4d4f' }}>
                ¥{totalPrice.toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowSaveModal(false)}
                style={{
                  flex: 1, padding: '10px', background: '#f5f7fa',
                  borderRadius: '8px', color: '#606266', fontSize: '14px',
                }}
              >
                取消
              </button>
              <button
                onClick={() => {
                  // MVP阶段：保存到localStorage
                  const buildData = {
                    id: `local-${Date.now()}`,
                    title: buildTitle,
                    parts: selectedParts.map(sp => ({ partId: sp.partId, quantity: sp.quantity })),
                    totalPrice,
                    totalScore: selectedParts.reduce((sum, sp) => sum + (sp.part.score || 0), 0),
                    likes: 0,
                    views: 0,
                    tags: [],
                    isOfficial: false,
                    status: 'published',
                    createdAt: new Date().toISOString(),
                  }
                  const savedBuilds = JSON.parse(localStorage.getItem('my-builds') || '[]')
                  savedBuilds.push(buildData)
                  localStorage.setItem('my-builds', JSON.stringify(savedBuilds))
                  alert('✅ 方案已保存到本地！')
                  setShowSaveModal(false)
                }}
                className="btn-buy"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                确认保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
