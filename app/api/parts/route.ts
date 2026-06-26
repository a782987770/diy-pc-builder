import { NextRequest, NextResponse } from 'next/server'
import { getAllParts, getPartsByCategory, searchParts } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const query = searchParams.get('q')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')

    let parts

    if (query) {
      parts = searchParts(query)
    } else if (category) {
      parts = getPartsByCategory(category)
    } else {
      parts = getAllParts()
    }

    // 分页
    const total = parts.length
    const start = (page - 1) * pageSize
    const paginatedParts = parts.slice(start, start + pageSize)

    return NextResponse.json({
      success: true,
      data: paginatedParts,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取配件列表失败' },
      { status: 500 }
    )
  }
}
