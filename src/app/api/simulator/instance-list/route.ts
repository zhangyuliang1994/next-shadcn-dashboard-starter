import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'http://127.0.0.1:9527/cm-simulator/api/v1';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/instance/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Instance list API proxy error:', error);
    return NextResponse.json(
      {
        code: '500',
        msg: error instanceof Error ? error.message : '服务器内部错误',
        data: [],
        cause: null
      },
      { status: 500 }
    );
  }
}
