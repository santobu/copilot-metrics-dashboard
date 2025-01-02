import { getRawCopilotMetricsForEnterpriseFromApi } from '@/services/copilot-metrics-service';
import { mongoClient } from '@/services/mongo-db-service';
import { CopilotUsage } from '@/types/CopilotUsage';
import { NextResponse } from 'next/server';

// New configuration syntax
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      console.log('Cron job unautorized');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const startAt = new Date();
    console.log('Cron job started at: ', startAt.toISOString());
    await mongoClient();

    const data = await getRawCopilotMetricsForEnterpriseFromApi() as any;
    
    if (data.status === "ERROR") {
      return NextResponse.json(
        { success: false, message: data.errors[0].message },
        { status: 500 }
      );
    }

    const copilotData = data.response
    for (const item of copilotData) {
      await storeCopilotData(item);
    }

    console.log('Cron job finished in', new Date().getTime() - startAt.getTime(), 'ms');
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

async function storeCopilotData(data: any) {
  const newUsage = new CopilotUsage({
    ...data,
    timestamp: new Date(),
  });
  const existingUsage = await CopilotUsage.findOne({ day: data.day });
  if (!existingUsage) {
    await newUsage.save();
  }
}
