/**
 * 轻量级数据库模块 - 使用JSON文件存储（MVP阶段）
 * 生产环境可替换为 PostgreSQL / Supabase
 */

import { Part, PCBuild } from './types'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

// ==================== 通用工具函数 ====================
function readJsonFile<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) return []
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw)
}

function writeJsonFile<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// ==================== 配件 CRUD ====================
export function getAllParts(): Part[] {
  return readJsonFile<Part>('parts.json')
}

export function getPartById(id: string): Part | undefined {
  return getAllParts().find(p => p.id === id)
}

export function getPartsByCategory(category: string): Part[] {
  return getAllParts().filter(p => p.category === category)
}

export function searchParts(query: string): Part[] {
  const lowerQuery = query.toLowerCase()
  return getAllParts().filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.brand.toLowerCase().includes(lowerQuery) ||
    p.category.includes(lowerQuery)
  )
}

export function addPart(part: Part): void {
  const parts = getAllParts()
  parts.push(part)
  writeJsonFile('parts.json', parts)
}

// ==================== 装机方案 CRUD ====================
export function getAllBuilds(): PCBuild[] {
  return readJsonFile<PCBuild>('builds.json')
}

export function getBuildById(id: string): PCBuild | undefined {
  return getAllBuilds().find(b => b.id === id)
}

export function getPublishedBuilds(options?: {
  sort?: 'hot' | 'newest' | 'price_asc' | 'price_desc' | 'likes'
  page?: number
  pageSize?: number
}): { builds: PCBuild[]; total: number; totalPages: number } {
  let builds = getAllBuilds().filter(b => b.status === 'published')

  // 排序
  switch (options?.sort) {
    case 'hot':
      builds.sort((a, b) => (b.views + b.likes * 10) - (a.views + a.likes * 10))
      break
    case 'newest':
      builds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case 'price_asc':
      builds.sort((a, b) => a.totalPrice - b.totalPrice)
      break
    case 'price_desc':
      builds.sort((a, b) => b.totalPrice - a.totalPrice)
      break
    case 'likes':
      builds.sort((a, b) => b.likes - a.likes)
      break
    default:
      builds.sort((a, b) => (b.views + b.likes * 10) - (a.views + a.likes * 10))
  }

  const total = builds.length
  const pageSize = options?.pageSize || 12
  const page = options?.page || 1
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const paginatedBuilds = builds.slice(start, start + pageSize)

  return { builds: paginatedBuilds, total, totalPages }
}

export function addBuild(build: PCBuild): void {
  const builds = getAllBuilds()
  builds.push(build)
  writeJsonFile('builds.json', builds)
}

export function incrementBuildLikes(id: string): void {
  const builds = getAllBuilds()
  const build = builds.find(b => b.id === id)
  if (build) {
    build.likes++
    writeJsonFile('builds.json', builds)
  }
}

// ==================== 兼容性检查 ====================
export interface CompatibilityCheckResult {
  isCompatible: boolean
  issues: Array<{
    severity: 'error' | 'warning' | 'info'
    message: string
  }>
  estimatedPower: number
  totalScore: number
}

export function checkCompatibility(partIds: { partId: string; quantity: number }[]): CompatibilityCheckResult {
  const issues: CompatibilityCheckResult['issues'] = []
  let totalPower = 0
  let totalScore = 0

  const selectedParts = partIds.map(pi => getPartById(pi.partId)).filter(Boolean) as Part[]
  if (selectedParts.length === 0) {
    return { isCompatible: false, issues: [{ severity: 'error', message: '未选择任何配件' }], estimatedPower: 0, totalScore: 0 }
  }

  const cpu = selectedParts.find(p => p.category === 'cpu')
  const motherboard = selectedParts.find(p => p.category === 'motherboard')
  const memory = selectedParts.find(p => p.category === 'memory')
  const gpu = selectedParts.find(p => p.category === 'gpu')
  const psu = selectedParts.find(p => p.category === 'psu')
  const storage = selectedParts.find(p => p.category === 'storage')
  const pcCase = selectedParts.find(p => p.category === 'case')
  const cooler = selectedParts.find(p => p.category === 'cooler')

  // 1. CPU与主板接口匹配
  if (cpu && motherboard && cpu.specs.socket && motherboard.specs.supportedSocket) {
    if (cpu.specs.socket !== motherboard.specs.supportedSocket) {
      issues.push({
        severity: 'error',
        message: `CPU接口(${cpu.specs.socket})与主板接口(${motherboard.specs.supportedSocket})不兼容`
      })
    }
  }

  // 2. 内存类型匹配
  if (memory && motherboard && memory.specs.memoryType && motherboard.specs.supportedMemoryType) {
    if (memory.specs.memoryType !== motherboard.specs.supportedMemoryType) {
      issues.push({
        severity: 'error',
        message: `内存类型(${memory.specs.memoryType})与主板支持类型(${motherboard.specs.supportedMemoryType})不匹配`
      })
    }
  }

  // 3. 电源功率检查
  if (gpu) totalPower += gpu.specs.tdpW || 0
  if (cpu) totalPower += cpu.specs.tdp || 0
  // 其他组件预估功耗
  totalPower += 50 // 主板+内存+硬盘等基础功耗
  if (totalPower > 0 && psu && psu.specs.wattage) {
    if (totalPower > psu.specs.wattage * 0.85) {
      issues.push({
        severity: 'warning',
        message: `预估功耗${Math.round(totalPower)}W，接近电源额定功率${psu.specs.wattage}W的85%，建议升级电源`
      })
    }
  }

  // 4. 显卡长度 vs 机箱
  if (gpu && pcCase && gpu.specs.length && pcCase.specs.maxGpuLength) {
    if (gpu.specs.length > pcCase.specs.maxGpuLength) {
      issues.push({
        severity: 'error',
        message: `显卡长度(${gpu.specs.length}mm)超过机箱最大支持长度(${pcCase.specs.maxGpuLength}mm)`
      })
    }
  }

  // 5. 散热器高度 vs 机箱
  if (cooler && pcCase && cooler.specs.height && pcCase.specs.maxCoolerHeight) {
    if (cooler.specs.height > pcCase.specs.maxCoolerHeight) {
      issues.push({
        severity: 'error',
        message: `散热器高度(${cooler.specs.height}mm)超过机箱最大支持高度(${pcCase.specs.maxCoolerHeight}mm)`
      })
    }
  }

  // 计算总跑分
  selectedParts.forEach(p => {
    totalScore += p.score || 0
  })

  const hasErrors = issues.some(i => i.severity === 'error')

  return {
    isCompatible: !hasErrors,
    issues,
    estimatedPower: Math.round(totalPower),
    totalScore
  }
}
