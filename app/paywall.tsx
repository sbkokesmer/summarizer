import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Zap, FileText, Globe, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/ThemeContext';
import { PrimaryButton } from '@/components/PrimaryButton';
import { usePurchases } from '@/context/PurchasesContext';
import { FREE_LIMIT } from '@/services/usageStore';

const FEATURES = [
  {
    id: 'unlimited',
    icon: Zap,
    title: 'Unlimited Processing',
    desc: 'No daily limits on summaries or translations.',
  },
  {
    id: 'documents',
    icon: FileText,
    title: 'Advanced Documents',
    desc: 'Support for large PDFs, Word, and Excel files.',
  },
  {
    id: 'translation',
    icon: Globe,
    title: 'Pro Translation',
    desc: 'Access to premium neural translation models.',
  },
  {
    id: 'quality',
    icon: Sparkles,
    title: 'Highest Quality',
    desc: 'Get the most accurate and detailed results.',
  },
];

export default function PaywallScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentOffering, purchasePackage, restorePurchases, isLoadingPurchases, usageCount, remainingFreeUses } = usePurchases();

  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [isLoading, setIsLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const annualPackage = currentOffering?.annual ?? currentOffering?.availablePackages?.find(
    (p: any) => p.packageType === 'ANNUAL'
  );
  const monthlyPackage = currentOffering?.monthly ?? currentOffering?.availablePackages?.find(
    (p: any) => p.packageType === 'MONTHLY'
  );

  const annualPrice = annualPackage?.product?.priceString ?? '$29.99';
  const monthlyPrice = monthlyPackage?.product?.priceString ?? '$4.99';

  const annualMonthly = annualPackage
    ? `Just ${(annualPackage.product.price / 12).toLocaleString('en-US', { style: 'currency', currency: annualPackage.product.currencyCode ?? 'USD', minimumFractionDigits: 2 })} / month`
    : 'Just $2.49 / month';

  const handleSubscribe = async () => {
    setErrorMessage(null);

    if (Platform.OS === 'web') {
      setErrorMessage('In-app purchases are only available on the iOS or Android app.');
      return;
    }

    const pkg = selectedPlan === 'annual' ? annualPackage : monthlyPackage;

    if (!pkg) {
      setErrorMessage('Products are loading, please try again.');
      return;
    }

    setIsLoading(true);
    const { success, error } = await purchasePackage(pkg);
    setIsLoading(false);

    if (error) {
      setErrorMessage(error);
      return;
    }

    if (success) {
      router.back();
    }
  };

  const handleRestore = async () => {
    setErrorMessage(null);
    setRestoreLoading(true);
    const { success, error } = await restorePurchases();
    setRestoreLoading(false);

    if (error) {
      setErrorMessage(error);
      return;
    }

    if (success) {
      router.back();
    } else {
      setErrorMessage('No active subscription found.');
    }
  };

  const backgroundGradient: [string, string, string] = isDark
    ? ['#000000', '#111111', '#000000']
    : ['#FFFFFF', '#F8F8F8', '#FFFFFF'];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={backgroundGradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 180 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <X size={20} color={colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View style={[styles.iconContainer, { backgroundColor: colors.text }]}>
            <Sparkles size={32} color={colors.background} strokeWidth={1.5} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Unlock Pro</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Experience the full power of AI for your documents. Work faster, smarter, and without limits.
          </Text>

          <View style={[styles.usageIndicator, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
            <Text style={[styles.usageLabel, { color: colors.textSecondary }]}>Free uses</Text>
            <View style={styles.usageDots}>
              {Array.from({ length: FREE_LIMIT }).map((_, i) => (
                <View key={i} style={[styles.usageDot, { backgroundColor: i < remainingFreeUses ? '#34C759' : (isDark ? '#333' : '#D1D1D6') }]} />
              ))}
            </View>
            <Text style={[styles.usageCount, { color: remainingFreeUses === 0 ? '#FF3B30' : colors.text }]}>
              {remainingFreeUses === 0 ? 'All used' : `${remainingFreeUses} left`}
            </Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <View key={feature.id} style={styles.featureRow}>
                <View style={[styles.featureIconBg, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
                  <Icon size={22} color={colors.text} strokeWidth={1.5} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{feature.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.plansContainer}>
          <TouchableOpacity
            style={[
              styles.planCard,
              {
                backgroundColor: selectedPlan === 'annual' ? (isDark ? '#1C1C1E' : '#F2F2F7') : 'transparent',
                borderColor: selectedPlan === 'annual' ? colors.text : (isDark ? '#333' : '#E5E5EA'),
                borderWidth: selectedPlan === 'annual' ? 2 : 1,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => setSelectedPlan('annual')}
          >
            <View style={styles.planHeader}>
              <Text style={[styles.planName, { color: colors.text }]}>Annual</Text>
              <View style={[styles.badge, { backgroundColor: colors.text }]}>
                <Text style={[styles.badgeText, { color: colors.background }]}>Save 50%</Text>
              </View>
            </View>
            <View style={styles.planPriceRow}>
              <Text style={[styles.planPrice, { color: colors.text }]}>
                {annualPrice}
                <Text style={styles.planPeriod}> / year</Text>
              </Text>
              <Text style={[styles.planOriginalPrice, { color: colors.textSecondary }]}>
                {annualPackage
                  ? (annualPackage.product.price * 2).toLocaleString('en-US', { style: 'currency', currency: annualPackage.product.currencyCode ?? 'USD', minimumFractionDigits: 2 })
                  : '$59.99'}
              </Text>
            </View>
            <Text style={[styles.planEquivalent, { color: colors.textSecondary }]}>{annualMonthly}</Text>

            {selectedPlan === 'annual' && (
              <View style={styles.checkIcon}>
                <CheckCircle2 size={20} color={colors.text} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              {
                backgroundColor: selectedPlan === 'monthly' ? (isDark ? '#1C1C1E' : '#F2F2F7') : 'transparent',
                borderColor: selectedPlan === 'monthly' ? colors.text : (isDark ? '#333' : '#E5E5EA'),
                borderWidth: selectedPlan === 'monthly' ? 2 : 1,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text style={[styles.planName, { color: colors.text }]}>Monthly</Text>
            <Text style={[styles.planPrice, { color: colors.text }]}>
              {monthlyPrice}
              <Text style={styles.planPeriod}> / month</Text>
            </Text>

            {selectedPlan === 'monthly' && (
              <View style={styles.checkIcon}>
                <CheckCircle2 size={20} color={colors.text} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {errorMessage && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}
      </ScrollView>

      <BlurView
        intensity={80}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.bottomBlur,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 24 },
        ]}
      >
        <View style={styles.bottomContent}>
          <PrimaryButton
            title="Subscribe Now"
            onPress={handleSubscribe}
            isLoading={isLoading || isLoadingPurchases}
          />

          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>Terms</Text>
            </TouchableOpacity>
            <Text style={[styles.footerDot, { color: colors.textSecondary }]}>•</Text>
            <TouchableOpacity onPress={handleRestore} disabled={restoreLoading}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                {restoreLoading ? 'Restoring...' : 'Restore'}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.footerDot, { color: colors.textSecondary }]}>•</Text>
            <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>Privacy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 48,
  },
  usageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  usageLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  usageDots: {
    flexDirection: 'row',
    gap: 5,
    flex: 1,
  },
  usageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  usageCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    transform: [{ rotate: '-5deg' }],
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginBottom: 48,
    gap: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  featureDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    borderRadius: 24,
    padding: 20,
    position: 'relative',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  planPeriod: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.6,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  planOriginalPrice: {
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  planEquivalent: {
    fontSize: 14,
    marginTop: 4,
  },
  checkIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  bottomBlur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  bottomContent: {
    paddingHorizontal: 24,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footerDot: {
    fontSize: 13,
    opacity: 0.5,
  },
});
