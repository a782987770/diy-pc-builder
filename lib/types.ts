// ==================== 配件类型枚举 ====================
export type PartCategory =
  | 'cpu'
  | 'motherboard'
  | 'memory'
  | 'storage'
  | 'gpu'
  | 'psu'
  | 'case'
  | 'cooler'

export type SocketType = 'AM5' | 'LGA1700' | 'LGA1851' | 'LGA1200' | 'AM4'
export type MemoryType = 'DDR4' | 'DDR5'
export type StorageType = 'NVMe_SSD' | 'SATA_SSD' | 'HDD'

// ==================== 配件接口 ====================
export interface Part {
  id: string
  name: string
  brand: string
  category: PartCategory
  price: number          // 当前价格（元）
  originalPrice?: number // 原价
  image?: string         // 图片URL
  specs: PartSpecs       // 详细规格
  cpsLinks: CPSLink[]    // 各平台CPS推广链接
  score?: number         // 跑分估算
  popularity: number     // 热度值
  createdAt: string
}

export interface PartSpecs {
  // CPU
  socket?: SocketType
  cores?: number
  threads?: number
  baseClock?: number     // GHz
  boostClock?: number    // GHz
  tdp?: number           // W

  // 主板
  supportedSocket?: SocketType
  supportedMemoryType?: MemoryType
  memorySlots?: number
  maxMemory?: number     // GB
  formFactor?: string    // ATX/M-ATX/ITX

  // 内存
  memoryType?: MemoryType
  capacity?: number      // GB
  frequency?: number     // MHz
  channels?: number

  // 存储
  storageType?: StorageType
  capacityGB?: number
  readSpeed?: number     // MB/s
  writeSpeed?: number    // MB/s
  interface_?: string    // PCIe/SATA

  // 显卡
  vram?: number          // GB
  length?: number        // mm
  tdpW?: number          // W

  // 电源
  wattage?: number       // W
  certification?: string // 金牌/铜牌等

  // 机箱
  maxGpuLength?: number  // mm
  maxCoolerHeight?: number // mm
  formFactorSupport?: string[]

  // 散热器
  height?: number        // mm
  tdpSupport?: number    // W
}

// ==================== CPS佣金链接 ====================
export interface CPSLink {
  platform: 'jd' | 'taobao' | 'pdd'
  url: string             // 推广链接
  commissionRate: number  // 佣金比例 (0.03 = 3%)
  priceAtPlatform: number // 该平台价格
}

// ==================== 装机方案 ====================
export interface PCBuild {
  id: string
  title: string
  description?: string
  coverImage?: string
  author: string
  parts: BuildPart[]       // 选中的配件列表
  totalPrice: number
  totalScore: number       // 综合跑分
  likes: number
  views: number
  tags: string[]
  isOfficial: boolean      // 是否官方推荐
  status: 'published' | 'draft' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface BuildPart {
  partId: string
  part: Part               // 关联的配件详情
  quantity: number         // 数量（通常为1）
}

// ==================== 兼容性检查结果 ====================
export interface CompatibilityResult {
  isCompatible: boolean
  issues: CompatibilityIssue[]
  warnings: CompatibilityIssue[]
  estimatedPower: number   // 预估功耗 W
  totalScore: number       // 总跑分
}

export interface CompatibilityIssue {
  severity: 'error' | 'warning' | 'info'
  category: string        // 如 "CPU-主板接口"
  message: string         // 具体描述
  affectedParts: string[] // 涉及的配件ID
}

// ==================== API响应 ====================
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
