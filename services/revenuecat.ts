import { Platform } from 'react-native';

export const REVENUECAT_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '',
  default: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
});

export const ENTITLEMENT_ID = 'Summarizer & Translator AI Pro';

export const PRODUCT_IDS = {
  annual: 'yearly',
  monthly: 'monthly',
  lifetime: 'lifetime',
};
