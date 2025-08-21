import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'http://127.0.0.1:9527/cm-simulator/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 构建请求体，如果没有instanceId则不传递该字段
    const requestBody: any = {
      pageNum: body.pageNum,
      pageSize: body.pageSize
    };

    // 只有当instanceId存在且不为空时才添加到请求体中
    if (
      body.instanceId !== undefined &&
      body.instanceId !== null &&
      body.instanceId !== ''
    ) {
      requestBody.instanceId = body.instanceId;
    }

    const response = await fetch(`${API_BASE_URL}/rcstInfo/queryPage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Station API proxy error:', error);
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
