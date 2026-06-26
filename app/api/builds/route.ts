import { NextRequest, NextResponse } from 'next/server'
import { getPublishedBuilds, getAllParts, getPartById } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = (searchParams.get('sort') as any) || 'hot'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '12')

    const result = getPublishedBuilds({ sort, page, pageSize })

    // 为每个方案填充配件详情
    const allParts = getAllParts()
    const partsMap: Record<string, any> = {}
    allParts.forEach(p => { partsMap[p.id] = p })

    const buildsWithParts = result.builds.map(build => ({
      ...build,
      parts: build.parts.map(bp => ({
        ...bp,
        part: partsMap[bp.partId] || null
      }))
    }))

    return NextResponse.json({
      success: true,
      data: {
        builds: buildsWithParts,
        total: result.total,
        totalPages: result.totalPages
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取装机方案失败' },
      { status: 500 }
    )
  }
}
