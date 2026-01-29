import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cleanup expired request logs (older than 4 days)
// Can be called via cron job or manually
export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Call the cleanup function
    const { data, error } = await supabase.rpc('cleanup_expired_request_logs');

    if (error) {
      console.error('[Logs Cleanup] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`[Logs Cleanup] Deleted ${data} expired logs`);
    return NextResponse.json({ success: true, deletedCount: data });
  } catch (error) {
    console.error('[Logs Cleanup] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cleanup logs' },
      { status: 500 }
    );
  }
}

// GET method to check log stats
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get log counts
    const { count: totalCount } = await supabase
      .from('request_logs')
      .select('*', { count: 'exact', head: true });

    const { count: expiredCount } = await supabase
      .from('request_logs')
      .select('*', { count: 'exact', head: true })
      .lt('expires_at', new Date().toISOString());

    return NextResponse.json({
      totalLogs: totalCount || 0,
      expiredLogs: expiredCount || 0,
    });
  } catch (error) {
    console.error('[Logs Stats] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get log stats' },
      { status: 500 }
    );
  }
}
