import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import {
  Search,
  FileText,
  Link as LinkIcon,
  Type,
  Mic,
  Camera,
  ChevronRight,
  Clock,
  Trash2,
  X,
  Copy,
  FileDown,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/context/ThemeContext';
import { exportToPdf } from '@/services/pdfExport';
import { FadeInView } from '@/components/FadeInView';
import { loadHistory, deleteHistoryItem, clearHistory, HistoryItem, InputType } from '@/services/historyStore';

const INPUT_ICON: Record<InputType, { icon: typeof FileText; color: string }> = {
  text: { icon: Type, color: '#007AFF' },
  file: { icon: FileText, color: '#FF9500' },
  url: { icon: LinkIcon, color: '#34C759' },
  audio: { icon: Mic, color: '#FF2D55' },
  camera: { icon: Camera, color: '#AF52DE' },
};

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadHistory().then(setItems);
    }, [])
  );

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.result.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteHistoryItem(id).then(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (selected?.id === id) setSelected(null);
    });
  };

  const handleClearAll = () => {
    Alert.alert(
      t('history.clear_title'),
      t('history.clear_desc'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('history.clear_confirm'),
          style: 'destructive',
          onPress: () => {
            clearHistory().then(() => setItems([]));
          },
        },
      ]
    );
  };

  const [exporting, setExporting] = useState(false);

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  const handleExportPdf = async (item: HistoryItem) => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportToPdf(item.result, item.title);
    } catch {}
    setExporting(false);
  };

  const gradientColors = isDark ? ['#1C1C1E', '#000000'] : ['#F2F2F7', '#FFFFFF'];

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradientColors} style={StyleSheet.absoluteFill} pointerEvents="none" />

      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('history.title')}</Text>
          {items.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7} style={styles.clearBtn}>
              <Trash2 size={18} color="#FF3B30" />
            </TouchableOpacity>
          )}
        </View>

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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 140 }]}
        showsVerticalScrollIndicator={false}
      >
        <FadeInView key={filteredItems.length === 0 ? 'empty' : 'list'}>
          {filteredItems.length > 0 ? (
            <View style={[styles.listContainer, { backgroundColor: colors.card }]}>
              {filteredItems.map((item, index) => {
                const { icon: Icon, color } = INPUT_ICON[item.inputType] ?? INPUT_ICON.text;
                const isLast = index === filteredItems.length - 1;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.listItem,
                      !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                    ]}
                    onPress={() => setSelected(item)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconWrapper, { backgroundColor: `${color}15` }]}>
                      <Icon size={20} color={color} strokeWidth={2} />
                    </View>

                    <View style={styles.itemContent}>
                      <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.itemMeta}>
                        <Text style={[styles.itemAction, { color: colors.textSecondary }]} numberOfLines={1}>
                          {item.action}
                        </Text>
                        <View style={styles.dot} />
                        <Text style={[styles.itemDate, { color: colors.textSecondary }]}>{item.date}</Text>
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
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                {searchQuery ? t('history.no_results') : t('history.empty_title')}
              </Text>
              <Text style={[styles.emptyStateDesc, { color: colors.textSecondary }]}>
                {searchQuery ? t('history.no_results_desc') : t('history.empty_desc')}
              </Text>
            </View>
          )}
        </FadeInView>
      </ScrollView>

      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
        {selected && (
          <View style={[styles.modalRoot, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border, backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
              <TouchableOpacity onPress={() => setSelected(null)} style={styles.modalCloseBtn} activeOpacity={0.7}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
                {selected.title}
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => handleCopy(selected.result)} style={styles.modalActionBtn} activeOpacity={0.7}>
                  <Copy size={18} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleExportPdf(selected)} style={styles.modalActionBtn} activeOpacity={0.7} disabled={exporting}>
                  <FileDown size={18} color={exporting ? colors.border : colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(selected.id)}
                  style={styles.modalActionBtn}
                  activeOpacity={0.7}
                >
                  <Trash2 size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={[styles.modalContent, { paddingBottom: insets.bottom + 32 }]}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalMeta}>
                {(() => {
                  const { icon: Icon, color } = INPUT_ICON[selected.inputType] ?? INPUT_ICON.text;
                  return (
                    <View style={[styles.modalMetaBadge, { backgroundColor: `${color}18` }]}>
                      <Icon size={14} color={color} strokeWidth={2} />
                      <Text style={[styles.modalMetaText, { color }]}>{selected.action}</Text>
                    </View>
                  );
                })()}
                <Text style={[styles.modalDate, { color: colors.textSecondary }]}>{selected.date}</Text>
              </View>

              <View style={[styles.resultBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.resultText, { color: colors.text }]}>{selected.result}</Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { fontSize: 34, fontWeight: '700', letterSpacing: -1 },
  clearBtn: { padding: 6 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', height: 44, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, height: '100%' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  listContainer: { borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  iconWrapper: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  itemContent: { flex: 1, justifyContent: 'center', minWidth: 0 },
  itemTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4, letterSpacing: -0.3 },
  itemMeta: { flexDirection: 'row', alignItems: 'center' },
  itemAction: { fontSize: 13, flexShrink: 1 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#999', marginHorizontal: 6, flexShrink: 0 },
  itemDate: { fontSize: 13, flexShrink: 0 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyStateTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptyStateDesc: { fontSize: 15, textAlign: 'center' },
  modalRoot: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
  modalCloseBtn: { padding: 4 },
  modalTitle: { flex: 1, fontSize: 16, fontWeight: '600', letterSpacing: -0.3 },
  modalActions: { flexDirection: 'row', gap: 4 },
  modalActionBtn: { padding: 6 },
  modalScroll: { flex: 1 },
  modalContent: { paddingHorizontal: 20, paddingTop: 20 },
  modalMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modalMetaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  modalMetaText: { fontSize: 13, fontWeight: '600' },
  modalDate: { fontSize: 13 },
  resultBox: { borderRadius: 16, borderWidth: 1, padding: 16 },
  resultText: { fontSize: 15, lineHeight: 24 },
});
