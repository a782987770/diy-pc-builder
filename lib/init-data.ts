/**
 * 数据初始化脚本
 * 将分散的配件JSON合并为统一的parts.json，并初始化builds.json
 * 运行: npx tsx lib/init-data.ts
 */

import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

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
  createdAt: string
}

function loadJsonFile<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename)
  if (!fs.existsSync(filePath)) return []
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function main() {
  // 合并所有配件数据
  const partFiles = [
    'parts-cpu.json',
    'parts-motherboard.json',
    'parts-memory.json',
    'parts-storage.json',
    'parts-gpu.json',
    'parts-psu.json',
    'parts-case.json',
    'parts-cooler.json',
  ]

  const allParts: Part[] = []
  for (const file of partFiles) {
    const parts = loadJsonFile<Part>(file)
    console.log(`[加载] ${file}: ${parts.length} 条记录`)
    allParts.push(...parts)
  }

  // 写入统一配件库
  fs.writeFileSync(
    path.join(DATA_DIR, 'parts.json'),
    JSON.stringify(allParts, null, 2),
    'utf-8'
  )
  console.log(`\n[完成] 配件库共 ${allParts.length} 条记录 → parts.json`)

  // 确认builds.json存在
  const builds = loadJsonFile<any>('builds.json')
  console.log(`[确认] 装机方案 ${builds.length} 条记录 → builds.json`)

  console.log('\n✅ 数据初始化完成！')
}

main()
