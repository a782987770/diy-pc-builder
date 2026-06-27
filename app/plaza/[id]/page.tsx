import buildsData from '@/data/builds.json'
import BuildDetailClient from './BuildDetailClient'

// ==================== 类型定义 ====================
interface PCBuild {
  id: string
  title: string
  description?: string
  author: string
  parts: Array<{ partId: string; quantity: number }>
  totalPrice: number
  totalScore: number
  likes: number
  views: number
  tags: string[]
  isOfficial: boolean
  status: string
  createdAt: string
}

// ==================== 静态参数生成（Next.js 静态导出必需） ====================
export function generateStaticParams() {
  const builds = buildsData as PCBuild[]
  return builds.map((build) => ({
    id: build.id,
  }))
}

// ==================== 页面元数据 ====================
export function generateMetadata({ params }: { params: { id: string } }) {
  const builds = buildsData as PCBuild[]
  const build = builds.find(b => b.id === params.id)
  return {
    title: build ? `${build.title} - 壹米装机大师` : '装机方案 - 壹米装机大师',
    description: build?.description || '查看装机方案详情',
  }
}

// ==================== 页面组件 ====================
export default function BuildDetailPage({ params }: { params: { id: string } }) {
  return <BuildDetailClient />
}
