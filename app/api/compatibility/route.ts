import { NextRequest, NextResponse } from 'next/server'
import { checkCompatibility } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { parts } = body

    if (!parts || !Array.isArray(parts)) {
      return NextResponse.json(
        { success: false, error: '请提供配件列表' },
        { status: 400 }
      )
    }

    const result = checkCompatibility(parts)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '兼容性检查失败' },
      { status: 500 }
    )
  }
}
