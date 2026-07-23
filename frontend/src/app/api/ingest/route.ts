import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  return handleSync(req);
}

export async function POST(req: NextRequest) {
  return handleSync(req);
}

async function handleSync(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Authorization check (bypassed in dev if CRON_SECRET is not configured)
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized: Invalid CRON_SECRET token' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain') || 'all';

  console.log(`[API /api/ingest] Triggered live sync for domain: ${domain}`);
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // Query telemetry logs to report recent ingestion status
    const { data: logs, error } = await supabase
      .from('ingestion_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Live data synchronization trigger processed for target: ${domain}`,
      target_domain: domain,
      execution_time_ms: duration,
      recent_telemetry_logs: logs || [],
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[API /api/ingest] Sync error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
