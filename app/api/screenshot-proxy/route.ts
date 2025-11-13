import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');
  const token = searchParams.get('token'); // API key

  if (!imageUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const parsedUrl = new URL(imageUrl);
    const trustedBase = new URL(env.AGP_BASE_URL);
    const isAllowedDomain =
        parsedUrl.protocol === 'https:' &&
        parsedUrl.hostname === trustedBase.hostname &&
        (trustedBase.port ? parsedUrl.port === trustedBase.port : true);
    if (!isAllowedDomain) {
      return new NextResponse('Invalid domain - only AgP URLs allowed', { status: 400 });
    }
  } catch {
    return new NextResponse('Invalid URL format', { status: 400 });
  }

  try {
    const headers: Record<string, string> = {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      return new NextResponse('No token provided', { status: 400 });
    }

    const response = await fetch(imageUrl, {
      headers,
      redirect: 'follow',
      cache: 'no-store'
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch screenshot: ${response.status}`, {
        status: response.status
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Failed to fetch screenshot', error);
    return new NextResponse('Failed to fetch screenshot', { status: 500 });
  }
}
