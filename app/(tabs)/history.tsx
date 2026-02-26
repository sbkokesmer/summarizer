import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, 
  FileText, 
  Link as LinkIcon, 
  Type, 
  ChevronRight,
  Clock
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';
import { FadeInView } from '@/components/FadeInView';

const HISTORY_DATA: { id: string; type: string; title: string; action: string; date: string; icon: typeof FileText; color: string }[] = [];

export default function HistoryScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');

  const gradientColors = isDark ? ['#1C1C1E', '#000000'] : ['#F2F2F7', '#FFFFFF'];

  const filteredData = HISTORY_DATA.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} />
      
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('history.title')}</Text>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('history.search_placeholder')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 140 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView>
          {filteredData.length > 0 ? (
            <View style={[styles.listContainer, { backgroundColor: colors.card }]}>
              {filteredData.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === filteredData.length - 1;
                
                return (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[
                      styles.listItem, 
                      !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconWrapper, { backgroundColor: `${item.color}15` }]}>
                      <Icon size={20} color={item.color} strokeWidth={2} />
                    </View>
                    
                    <View style={styles.itemContent}>
                      <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.itemMeta}>
                        <Text style={[styles.itemAction, { color: colors.textSecondary }]}>
                          {item.action}
                        </Text>
                        <View style={styles.dot} />
                        <Text style={[styles.itemDate, { color: colors.textSecondary }]}>
                          {item.date}
                        </Text>
                      </View>
                    </View>

                    <ChevronRight size={16} color={colors.textSecondary} opacity={0.5} />
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Clock size={48} color={colors.textSecondary} opacity={0.5} strokeWidth={1.5} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>{t('history.no_results')}</Text>
              <Text style={[styles.emptyStateDesc, { color: colors.textSecondary }]}>
                {t('history.no_results_desc')}
              </Text>
            </View>
          )}
        </FadeInView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 34, fontWeight: '700', letterSpacing: -1, marginBottom: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, height: '100%' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  listContainer: { borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  iconWrapper: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  itemContent: { flex: 1, justifyContent: 'center' },
  itemTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4, letterSpacing: -0.3 },
  itemMeta: { flexDirection: 'row', alignItems: 'center' },
  itemAction: { fontSize: 13 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#999', marginHorizontal: 6 },
  itemDate: { fontSize: 13 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptyStateDesc: { fontSize: 15, textAlign: 'center' },
});
