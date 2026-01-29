import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSMS } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  try {
    const { requestId } = await request.json();

    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch the medication request with store and driver details
    const { data: medRequest, error: reqError } = await supabase
      .from('medication_requests')
      .select(`
        *,
        from_store:stores!medication_requests_from_store_id_fkey(name, code, address),
        to_store:stores!medication_requests_to_store_id_fkey(name, code, address)
      `)
      .eq('id', requestId)
      .single();

    if (reqError || !medRequest) {
      console.error('[Notify Driver] Request not found:', reqError);
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (medRequest.status !== 'accepted') {
      return NextResponse.json({ error: 'Request is not in accepted status' }, { status: 400 });
    }

    // Find available driver for the requesting store (from_store)
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('store_id', medRequest.from_store_id)
      .eq('is_available', true)
      .eq('shift_status', 'on_duty')
      .limit(1)
      .single();

    if (driverError || !driver) {
      console.error('[Notify Driver] No available driver:', driverError);
      return NextResponse.json(
        { error: 'No available driver found for the requesting store' },
        { status: 404 }
      );
    }

    // Build the SMS message
    const toStore = medRequest.to_store;
    const fromStore = medRequest.from_store;
    const qty = medRequest.offered_quantity || medRequest.requested_quantity;

    // Build SMS - plain text only (emoji causes delivery failures on some carriers)
    const smsBody = `PharmSync Pickup: ${medRequest.medication_name} (${qty} units). ` +
      `Pickup from ${toStore?.name} (${toStore?.code})` +
      (toStore?.address ? ` at ${toStore.address}` : '') +
      `. Deliver to ${fromStore?.name} (${fromStore?.code})` +
      (fromStore?.address ? ` at ${fromStore.address}` : '') +
      `.`;

    // Send the SMS
    const message = await sendSMS(driver.phone, smsBody);

    // Update the request with driver info and notification timestamp
    await supabase
      .from('medication_requests')
      .update({
        driver_id: driver.id,
        driver_notified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    // Create in-app notification too
    await supabase.from('notifications').insert({
      store_id: medRequest.from_store_id,
      type: 'driver_notified',
      title: 'Driver Notified',
      message: `Driver ${driver.name} has been notified to pick up ${medRequest.medication_name} from ${toStore?.name}`,
      related_request_id: requestId,
    });

    console.log(`[Notify Driver] SMS sent to ${driver.name} (${driver.phone}) for request ${requestId}`);

    return NextResponse.json({
      success: true,
      driverName: driver.name,
      driverPhone: driver.phone,
      messageSid: message.sid,
    });
  } catch (error) {
    console.error('[Notify Driver] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to notify driver' },
      { status: 500 }
    );
  }
}
