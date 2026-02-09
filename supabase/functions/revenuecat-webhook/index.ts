// Supabase Edge Function: Handle RevenueCat Webhooks
// Deploy: supabase functions deploy revenuecat-webhook
//
// Configure in RevenueCat Dashboard → Project Settings → Integrations → Webhooks
// URL: https://<project-ref>.supabase.co/functions/v1/revenuecat-webhook
// Auth Header: Bearer <REVENUECAT_WEBHOOK_SECRET>

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');

serve(async (req: Request) => {
  // Verify webhook auth
  const authHeader = req.headers.get('Authorization');
  if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const body = await req.json();
    const event = body.event;
    const appUserId = body.app_user_id; // This is the Supabase user ID

    if (!event || !appUserId) {
      return new Response(JSON.stringify({ error: 'Missing event or app_user_id' }), { status: 400 });
    }

    console.log(`[RC Webhook] Event: ${event.type}, User: ${appUserId}`);

    // RevenueCat event types:
    // INITIAL_PURCHASE, RENEWAL, CANCELLATION, UNCANCELLATION,
    // BILLING_ISSUE, SUBSCRIBER_ALIAS, PRODUCT_CHANGE,
    // EXPIRATION, NON_RENEWING_PURCHASE, SUBSCRIPTION_PAUSED,
    // TRANSFER, SUBSCRIPTION_EXTENDED

    const subscriber = event.subscriber_info || event.subscriber;
    const productId = event.product_id;
    const store = mapStore(event.store);
    const transactionId = event.transaction_id || event.original_transaction_id;
    const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;
    const priceCents = event.price_in_purchased_currency
      ? Math.round(event.price_in_purchased_currency * 100)
      : null;
    const currency = event.currency || 'inr';

    // Determine what this purchase is for by matching product_id to our data
    const purchaseType = await determinePurchaseType(supabase, productId, appUserId);

    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'NON_RENEWING_PURCHASE': {
        // Record the purchase
        await supabase.from('purchases').upsert({
          user_id: appUserId,
          rc_product_id: productId,
          rc_transaction_id: transactionId,
          rc_entitlement_id: getEntitlementId(subscriber),
          store,
          amount_cents: priceCents,
          currency,
          type: purchaseType.type,
          reference_id: purchaseType.referenceId,
          status: 'active',
          purchased_at: new Date().toISOString(),
          expires_at: expiresAt,
        }, { onConflict: 'rc_transaction_id' });

        // Activate the membership/enrollment
        await activatePurchase(supabase, appUserId, purchaseType);
        break;
      }

      case 'RENEWAL': {
        // Update existing purchase with new expiry
        if (transactionId) {
          await supabase.from('purchases')
            .update({ status: 'active', expires_at: expiresAt })
            .eq('rc_transaction_id', transactionId);
        }
        // Re-activate in case it lapsed
        await activatePurchase(supabase, appUserId, purchaseType);
        break;
      }

      case 'CANCELLATION':
      case 'EXPIRATION': {
        // Mark purchase as expired/cancelled
        if (transactionId) {
          await supabase.from('purchases')
            .update({ status: event.type === 'CANCELLATION' ? 'cancelled' : 'expired' })
            .eq('rc_transaction_id', transactionId);
        }
        // Deactivate membership/enrollment
        await deactivatePurchase(supabase, appUserId, purchaseType);
        break;
      }

      case 'BILLING_ISSUE': {
        // Mark membership as inactive (billing problem)
        if (purchaseType.type === 'membership' && purchaseType.referenceId) {
          await supabase.from('memberships')
            .update({ status: 'inactive' })
            .eq('user_id', appUserId)
            .eq('community_id', purchaseType.referenceId);
        }
        break;
      }

      case 'UNCANCELLATION':
      case 'SUBSCRIPTION_EXTENDED': {
        // Re-activate
        if (transactionId) {
          await supabase.from('purchases')
            .update({ status: 'active', expires_at: expiresAt })
            .eq('rc_transaction_id', transactionId);
        }
        await activatePurchase(supabase, appUserId, purchaseType);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[RC Webhook] Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ─── Helpers ─────────────────────────────────────────────────

function mapStore(store: string): string {
  const map: Record<string, string> = {
    APP_STORE: 'app_store',
    PLAY_STORE: 'play_store',
    STRIPE: 'web',
    PROMOTIONAL: 'promotional',
  };
  return map[store] || 'app_store';
}

function getEntitlementId(subscriber: any): string | null {
  if (!subscriber?.entitlements) return null;
  const entries = Object.entries(subscriber.entitlements);
  if (entries.length > 0) return entries[0][0] as string;
  return null;
}

async function determinePurchaseType(supabase: any, productId: string, userId: string) {
  // Check if product matches a community membership
  const { data: community } = await supabase
    .from('communities')
    .select('id')
    .eq('membership_entitlement_id', productId)
    .single();

  if (community) {
    return { type: 'membership' as const, referenceId: community.id };
  }

  // Check if product matches a program
  const { data: program } = await supabase
    .from('programs')
    .select('id')
    .eq('rc_product_id', productId)
    .single();

  if (program) {
    return { type: 'program' as const, referenceId: program.id };
  }

  return { type: 'program' as const, referenceId: null };
}

async function activatePurchase(supabase: any, userId: string, purchaseType: { type: string; referenceId: string | null }) {
  if (!purchaseType.referenceId) return;

  if (purchaseType.type === 'membership') {
    await supabase.from('memberships').upsert({
      user_id: userId,
      community_id: purchaseType.referenceId,
      status: 'active',
      joined_at: new Date().toISOString(),
    }, { onConflict: 'user_id,community_id' });
  } else if (purchaseType.type === 'program') {
    await supabase.from('program_members').upsert({
      user_id: userId,
      program_id: purchaseType.referenceId,
      status: 'active',
      enrolled_at: new Date().toISOString(),
    }, { onConflict: 'user_id,program_id' });
  }
}

async function deactivatePurchase(supabase: any, userId: string, purchaseType: { type: string; referenceId: string | null }) {
  if (!purchaseType.referenceId) return;

  if (purchaseType.type === 'membership') {
    await supabase.from('memberships')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('community_id', purchaseType.referenceId);
  } else if (purchaseType.type === 'program') {
    await supabase.from('program_members')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('program_id', purchaseType.referenceId);
  }
}
