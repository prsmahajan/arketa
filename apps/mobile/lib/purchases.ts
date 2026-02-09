import Purchases, {
  type PurchasesOfferings,
  type PurchasesPackage,
  type CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// RevenueCat API keys (set these in your .env / app.json)
const RC_IOS_KEY = process.env.EXPO_PUBLIC_RC_IOS_KEY || '';
const RC_ANDROID_KEY = process.env.EXPO_PUBLIC_RC_ANDROID_KEY || '';

/**
 * Initialize RevenueCat with the current Supabase user.
 * Call this after auth is confirmed (in _layout or after login).
 */
export async function initPurchases(userId: string) {
  const apiKey = Platform.OS === 'ios' ? RC_IOS_KEY : RC_ANDROID_KEY;

  if (!apiKey) {
    console.warn('[Purchases] No RevenueCat API key set for', Platform.OS);
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  await Purchases.configure({
    apiKey,
    appUserID: userId, // Use Supabase user ID so webhook can map back
  });

  console.log('[Purchases] Initialized for user:', userId);
}

/**
 * Get available offerings (products) from RevenueCat.
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (err) {
    console.error('[Purchases] Failed to get offerings:', err);
    return null;
  }
}

/**
 * Purchase a package (subscription or one-time).
 * Returns the updated CustomerInfo on success, or null on failure/cancel.
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  try {
    const result = await Purchases.purchasePackage(pkg);
    return result.customerInfo;
  } catch (err: any) {
    if (err.userCancelled) {
      console.log('[Purchases] User cancelled');
      return null;
    }
    console.error('[Purchases] Purchase failed:', err);
    throw err;
  }
}

/**
 * Check if the current user has a specific entitlement.
 */
export async function hasEntitlement(entitlementId: string): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[entitlementId] !== undefined;
  } catch {
    return false;
  }
}

/**
 * Get current customer info (entitlements, subscriptions).
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

/**
 * Restore purchases (useful if user re-installs or switches devices).
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  try {
    return await Purchases.restorePurchases();
  } catch (err) {
    console.error('[Purchases] Restore failed:', err);
    return null;
  }
}

/**
 * After a successful purchase, also do a local enrollment
 * (the webhook will handle this too, but this provides instant UI feedback).
 */
export async function enrollAfterPurchase(
  userId: string,
  type: 'membership' | 'program',
  referenceId: string,
) {
  if (type === 'membership') {
    await supabase.from('memberships').upsert({
      user_id: userId,
      community_id: referenceId,
      status: 'active',
      joined_at: new Date().toISOString(),
    }, { onConflict: 'user_id,community_id' });
  } else if (type === 'program') {
    await supabase.from('program_members').upsert({
      user_id: userId,
      program_id: referenceId,
      status: 'active',
      enrolled_at: new Date().toISOString(),
    }, { onConflict: 'user_id,program_id' });
  }
}
