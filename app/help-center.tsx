import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { ChevronDown, ChevronUp, Mail, MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_EN: FAQItem[] = [
  {
    question: 'How does the summarization work?',
    answer:
      'Our AI-powered summarization analyzes your text, document, or audio input and generates a concise summary. You can choose different summary styles including bullet points, paragraph form, or key takeaways. The AI processes your content in real-time and delivers results in seconds.',
  },
  {
    question: 'What file formats are supported?',
    answer:
      'We support PDF, DOCX, and TXT files up to 10MB. For audio, we accept most common formats. You can also paste text directly, provide a URL to an article, or use your camera to scan printed text.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. We follow a strict zero-data-retention policy. Your files and text are processed in real-time and are never stored on our servers after the response is delivered. All data is encrypted during transmission using TLS 1.3.',
  },
  {
    question: 'Which languages are supported for translation?',
    answer:
      'We currently support English, Spanish, French, German, Italian, Turkish, Japanese, Korean, and Chinese. You can translate your summaries into any of these languages or keep the original language.',
  },
  {
    question: 'How do I change the app language?',
    answer:
      'Go to Settings and tap on the Language option. You can choose between English and Turkish for the app interface. This is separate from the output language used for summaries and translations.',
  },
  {
    question: 'What is included in the Pro plan?',
    answer:
      'The Pro plan includes unlimited summarizations and translations, access to advanced AI models for higher quality results, priority processing speed, and longer document support.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'You can delete your account by going to Settings and contacting our support team. All your account data will be permanently removed within 30 days. Your local history can be cleared separately from the History tab.',
  },
  {
    question: 'Why is my summary not accurate?',
    answer:
      'AI summarization works best with clear, well-structured text. If the input contains a lot of jargon, informal language, or poor formatting, the quality may vary. Try adjusting the summary style or providing cleaner input for better results.',
  },
];

const FAQ_TR: FAQItem[] = [
  {
    question: 'Ozetleme nasil calisiyor?',
    answer:
      'Yapay zeka destekli ozetlememiz metninizi, belgenizi veya ses girdinizi analiz eder ve kisa bir ozet olusturur. Madde isaretleri, paragraf formu veya anahtar cikarimlari dahil farkli ozet stilleri secebilirsiniz.',
  },
  {
    question: 'Hangi dosya formatlari destekleniyor?',
    answer:
      '10MB\'a kadar PDF, DOCX ve TXT dosyalarini destekliyoruz. Ses icin yaygin formatlarin cogunu kabul ediyoruz. Ayrica dogrudan metin yapistirabilir, bir makale URL\'si saglayabilir veya basilmis metni taramak icin kameranizi kullanabilirsiniz.',
  },
  {
    question: 'Verilerim guvende mi?',
    answer:
      'Evet. Sifir veri saklama politikasi uyguluyoruz. Dosyalariniz ve metinleriniz gercek zamanli olarak islenir ve yanit cihaziniza iletildikten sonra sunucularimizda asla saklanmaz.',
  },
  {
    question: 'Ceviri icin hangi diller destekleniyor?',
    answer:
      'Su anda Ingilizce, Ispanyolca, Fransizca, Almanca, Italyanca, Turkce, Japonca, Korece ve Cince destekliyoruz.',
  },
  {
    question: 'Uygulama dilini nasil degistiririm?',
    answer:
      'Ayarlar\'a gidin ve Dil secenegine dokunun. Uygulama arayuzu icin Ingilizce ve Turkce arasinda secim yapabilirsiniz.',
  },
  {
    question: 'Pro plana neler dahil?',
    answer:
      'Pro plan sinirsiz ozetleme ve ceviri, daha yuksek kaliteli sonuclar icin gelismis yapay zeka modellerine erisim, oncelikli isleme hizi ve daha uzun belge destegi icerir.',
  },
  {
    question: 'Hesabimi nasil silerim?',
    answer:
      'Ayarlar\'a gidip destek ekibimizle iletisime gecerek hesabinizi silebilirsiniz. Tum hesap verileriniz 30 gun icinde kalici olarak kaldirilacaktir.',
  },
  {
    question: 'Ozetim neden dogru degil?',
    answer:
      'Yapay zeka ozetleme, acik ve iyi yapilandirilmis metinlerle en iyi sekilde calisir. Girdi cok fazla jargon veya kotu bicimlenme iceriyorsa kalite degisebilir. Daha iyi sonuclar icin ozet stilini ayarlamayi deneyin.',
  },
];

function AccordionItem({ item, colors }: { item: FAQItem; colors: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.faqItem, { borderBottomColor: colors.border }]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, { color: colors.text }]}>{item.question}</Text>
        {expanded ? (
          <ChevronUp size={18} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={18} color={colors.textSecondary} />
        )}
      </View>
      {expanded && (
        <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{item.answer}</Text>
      )}
    </TouchableOpacity>
  );
}

export default function HelpCenterScreen() {
  const { colors } = useTheme();
  const { i18n } = useTranslation();
  const faqData = i18n.language === 'tr' ? FAQ_TR : FAQ_EN;

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@summalingua.com?subject=Help%20Request');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: colors.text }]}>
        {i18n.language === 'tr' ? 'Yardim Merkezi' : 'Help Center'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {i18n.language === 'tr'
          ? 'Sikca sorulan sorulara goz atin veya bize ulasin.'
          : 'Browse frequently asked questions or reach out to us.'}
      </Text>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          {i18n.language === 'tr' ? 'SIKCA SORULAN SORULAR' : 'FREQUENTLY ASKED QUESTIONS'}
        </Text>
      </View>

      <View style={[styles.faqContainer, { backgroundColor: colors.card }]}>
        {faqData.map((item, index) => (
          <AccordionItem key={index} item={item} colors={colors} />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          {i18n.language === 'tr' ? 'ILETISIM' : 'CONTACT US'}
        </Text>
      </View>

      <View style={[styles.contactContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.contactRow, { borderBottomColor: colors.border }]}
          onPress={handleEmailSupport}
          activeOpacity={0.7}
        >
          <View style={[styles.contactIcon, { backgroundColor: colors.background }]}>
            <Mail size={20} color={colors.text} />
          </View>
          <View style={styles.contactText}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>
              {i18n.language === 'tr' ? 'E-posta Destegi' : 'Email Support'}
            </Text>
            <Text style={[styles.contactDesc, { color: colors.textSecondary }]}>
              support@summalingua.com
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactRow}
          onPress={handleEmailSupport}
          activeOpacity={0.7}
        >
          <View style={[styles.contactIcon, { backgroundColor: colors.background }]}>
            <MessageCircle size={20} color={colors.text} />
          </View>
          <View style={styles.contactText}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>
              {i18n.language === 'tr' ? 'Geri Bildirim Gonder' : 'Send Feedback'}
            </Text>
            <Text style={[styles.contactDesc, { color: colors.textSecondary }]}>
              {i18n.language === 'tr'
                ? 'Uygulamayi gelistirmemize yardimci olun'
                : 'Help us improve the app'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 8,
    marginLeft: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  faqContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 28,
  },
  faqItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    letterSpacing: -0.2,
  },
  faqAnswer: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    letterSpacing: -0.1,
  },
  contactContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'transparent',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  contactDesc: {
    fontSize: 14,
  },
});
