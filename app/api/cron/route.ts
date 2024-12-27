import { NextResponse } from 'next/server';

// New configuration syntax
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await performCronTask();

    return NextResponse.json(
      { success: true, message: 'Cron job executed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function performCronTask() {
  // Implement cron job logic here
  console.log('Cron job running at:', new Date().toISOString());
}