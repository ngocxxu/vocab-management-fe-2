import { NextResponse } from 'next/server';
import { logger } from '@/libs/Logger';

export async function GET() {
  const startTime = Date.now();
  try {
    const backendUrl = `${process.env.NESTJS_API_URL || 'http://localhost:3002/api/v1'}/health`;

    logger.info('Health check: Sending request to backend', {
      url: backendUrl,
    });

    const nestResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const responseText = await nestResponse.text();
    let data: unknown;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { message: responseText || 'Unknown response' };
    }

    const duration = Date.now() - startTime;

    if (!nestResponse.ok) {
      logger.error('Health check: Backend returned error', {
        status: nestResponse.status,
        statusText: nestResponse.statusText,
        responseData: data,
        duration: `${duration}ms`,
      });

      return NextResponse.json(
        {
          error: `Health check failed: ${nestResponse.statusText}`,
          ...(typeof data === 'object' && data !== null ? data : {}),
        },
        { status: nestResponse.status },
      );
    }

    logger.info('Health check: Success', {
      status: nestResponse.status,
      responseData: data,
      duration: `${duration}ms`,
    });

    return NextResponse.json(data, { status: nestResponse.status });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Health check: Exception occurred', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
    });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to check health',
        success: false,
      },
      { status: 500 },
    );
  }
}
