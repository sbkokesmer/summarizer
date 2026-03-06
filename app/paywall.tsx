import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, Zap, FileText, Globe, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/ThemeContext';
import { PrimaryButton } from '@/components/PrimaryButton';

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

  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = () => {
    setIsLoading(true);
    // Simulate purchase process
    setTimeout(() => {
      setIsLoading(false);
      router.back();
    }, 1500);
  };

  // Premium subtle gradients
  const backgroundGradient = isDark 
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
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 180 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <X size={20} color={colors.text} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={[styles.iconContainer, { backgroundColor: colors.text }]}>
            <Sparkles size={32} color={colors.background} strokeWidth={1.5} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Unlock Pro</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Experience the full power of AI for your documents. Work faster, smarter, and without limits.
          </Text>
        </View>

        {/* Features List */}
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

        {/* Plan Selection */}
        <View style={styles.plansContainer}>
          <TouchableOpacity 
            style={[
              styles.planCard, 
              { 
                backgroundColor: selectedPlan === 'annual' ? (isDark ? '#1C1C1E' : '#F2F2F7') : 'transparent',
                borderColor: selectedPlan === 'annual' ? colors.text : (isDark ? '#333' : '#E5E5EA'),
                borderWidth: selectedPlan === 'annual' ? 2 : 1,
              }
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
            <Text style={[styles.planPrice, { color: colors.text }]}>$29.99<Text style={styles.planPeriod}> / year</Text></Text>
            <Text style={[styles.planEquivalent, { color: colors.textSecondary }]}>Just $2.49 / month</Text>
            
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
              }
            ]}
            activeOpacity={0.8}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text style={[styles.planName, { color: colors.text }]}>Monthly</Text>
            <Text style={[styles.planPrice, { color: colors.text }]}>$4.99<Text style={styles.planPeriod}> / month</Text></Text>
            
            {selectedPlan === 'monthly' && (
              <View style={styles.checkIcon}>
                <CheckCircle2 size={20} color={colors.text} />
              </View>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Floating Bottom Action Area */}
      <BlurView 
        intensity={80} 
        tint={isDark ? 'dark' : 'light'} 
        style={[
          styles.bottomBlur,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : 24 }
        ]}
      >
        <View style={styles.bottomContent}>
          <PrimaryButton 
            title={selectedPlan === 'annual' ? "Start Free Trial" : "Subscribe Now"} 
            onPress={handleSubscribe}
            isLoading={isLoading}
          />
          
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>Terms</Text>
            </TouchableOpacity>
            <Text style={[styles.footerDot, { color: colors.textSecondary }]}>•</Text>
            <TouchableOpacity onPress={() => {}}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>Restore</Text>
            </TouchableOpacity>
            <Text style={[styles.footerDot, { color: colors.textSecondary }]}>•</Text>
            <TouchableOpacity onPress={() => {}}>
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
  planEquivalent: {
    fontSize: 14,
    marginTop: 4,
  },
  checkIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
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
