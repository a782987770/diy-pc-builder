import { NextRequest, NextResponse } from 'next/server'
import { incrementBuildLikes } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    incrementBuildLikes(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '点赞失败' },
      { status: 500 }
    )
  }
}
