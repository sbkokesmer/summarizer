import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { REVENUECAT_API_KEY, ENTITLEMENT_ID } from '@/services/revenuecat';
import { getUsageCount, incrementUsage, FREE_LIMIT } from '@/services/usageStore';
import { useAuth } from '@/context/AuthContext';

interface PurchasesContextType {
  isPro: boolean;
  isLoadingPurchases: boolean;
  currentOffering: any | null;
  usageCount: number;
  remainingFreeUses: number;
  canUse: boolean;
  consumeUsage: () => Promise<boolean>;
  purchasePackage: (pkg: any) => Promise<{ success: boolean; error: string | null }>;
  restorePurchases: () => Promise<{ success: boolean; error: string | null }>;
  refreshPurchaserInfo: () => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextType | null>(null);

export function PurchasesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true);
  const [currentOffering, setCurrentOffering] = useState<any | null>(null);
  const [Purchases, setPurchases] = useState<any>(null);
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    initRevenueCat();
  }, []);

  useEffect(() => {
    if (user) {
      loadUsage(user.id);
    } else {
      setUsageCount(0);
    }
  }, [user]);

  const loadUsage = async (userId: string) => {
    const count = await getUsageCount(userId);
    setUsageCount(count);
  };

  const initRevenueCat = async () => {
    if (Platform.OS === 'web') {
      setIsLoadingPurchases(false);
      return;
    }

    try {
      const rc = await import('react-native-purchases');
      const PurchasesModule = rc.default;
      setPurchases(PurchasesModule);

      await PurchasesModule.configure({ apiKey: REVENUECAT_API_KEY! });

      const info = await PurchasesModule.getCustomerInfo();
      const proEntitlement = info.entitlements.active[ENTITLEMENT_ID];
      setIsPro(!!proEntitlement);

      const offerings = await PurchasesModule.getOfferings();
      if (offerings.current) {
        setCurrentOffering(offerings.current);
      }
    } catch (e) {
      console.warn('RevenueCat init error:', e);
    } finally {
      setIsLoadingPurchases(false);
    }
  };

  const consumeUsage = useCallback(async (): Promise<boolean> => {
    if (isPro) return true;
    if (!user) return usageCount < FREE_LIMIT;
    if (usageCount >= FREE_LIMIT) return false;
    const next = await incrementUsage(user.id);
    setUsageCount(next);
    return true;
  }, [isPro, usageCount, user]);

  const purchasePackage = useCallback(async (pkg: any): Promise<{ success: boolean; error: string | null }> => {
    if (!Purchases) return { success: false, error: 'RevenueCat not available on this platform.' };

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
      setIsPro(!!proEntitlement);
      return { success: !!proEntitlement, error: null };
    } catch (e: any) {
      if (e.userCancelled) return { success: false, error: null };
      return { success: false, error: e.message ?? 'Purchase failed.' };
    }
  }, [Purchases]);

  const restorePurchases = useCallback(async (): Promise<{ success: boolean; error: string | null }> => {
    if (!Purchases) return { success: false, error: 'RevenueCat not available on this platform.' };

    try {
      const info = await Purchases.restorePurchases();
      const proEntitlement = info.entitlements.active[ENTITLEMENT_ID];
      setIsPro(!!proEntitlement);
      return { success: !!proEntitlement, error: null };
    } catch (e: any) {
      return { success: false, error: e.message ?? 'Restore failed.' };
    }
  }, [Purchases]);

  const refreshPurchaserInfo = useCallback(async () => {
    if (!Purchases) return;

    try {
      const info = await Purchases.getCustomerInfo();
      const proEntitlement = info.entitlements.active[ENTITLEMENT_ID];
      setIsPro(!!proEntitlement);
    } catch (e) {
      console.warn('RefreshPurchaserInfo error:', e);
    }
  }, [Purchases]);

  const remainingFreeUses = Math.max(0, FREE_LIMIT - usageCount);
  const canUse = isPro || usageCount < FREE_LIMIT;

  return (
    <PurchasesContext.Provider value={{
      isPro,
      isLoadingPurchases,
      currentOffering,
      usageCount,
      remainingFreeUses,
      canUse,
      consumeUsage,
      purchasePackage,
      restorePurchases,
      refreshPurchaserInfo,
    }}>
      {children}
    </PurchasesContext.Provider>
  );
}

export function usePurchases() {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error('usePurchases must be used within PurchasesProvider');
  return ctx;
}
