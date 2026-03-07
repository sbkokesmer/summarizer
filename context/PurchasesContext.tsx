import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { REVENUECAT_API_KEY, ENTITLEMENT_ID } from '@/services/revenuecat';

interface PurchasesContextType {
  isPro: boolean;
  isLoadingPurchases: boolean;
  currentOffering: any | null;
  purchasePackage: (pkg: any) => Promise<{ success: boolean; error: string | null }>;
  restorePurchases: () => Promise<{ success: boolean; error: string | null }>;
  refreshPurchaserInfo: () => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextType | null>(null);

export function PurchasesProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true);
  const [currentOffering, setCurrentOffering] = useState<any | null>(null);
  const [Purchases, setPurchases] = useState<any>(null);

  useEffect(() => {
    initRevenueCat();
  }, []);

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

  return (
    <PurchasesContext.Provider value={{
      isPro,
      isLoadingPurchases,
      currentOffering,
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
