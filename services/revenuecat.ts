import { Platform } from 'react-native';

export const REVENUECAT_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '',
  default: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
});

export const ENTITLEMENT_ID = 'pro';

export const PRODUCT_IDS = {
  annual: 'pro_annual',
  monthly: 'pro_monthly',
};
