import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const response = await fetch(
      buildApiUrl(API_ENDPOINTS.INSTANCE.GET_BY_ID(id)),
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      {
        code: '500',
        msg: error instanceof Error ? error.message : '服务器内部错误',
        data: null,
        cause: null
      },
      { status: 500 }
    );
  }
}
