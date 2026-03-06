import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

const LAST_UPDATED = 'March 6, 2026';
const APP_NAME = 'SummaLingua';
const COMPANY_NAME = 'SummaLingua';

const sections = [
  {
    title: '1. Introduction',
    body: `Welcome to ${APP_NAME}. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services (collectively, the "Service").

By using the Service, you agree to the collection and use of information in accordance with this policy. If you do not agree with any part of this policy, please do not use our Service.`,
  },
  {
    title: '2. Information We Collect',
    body: `We collect several types of information to provide and improve our Service:

a) Account Information
When you create an account, we collect your email address and an encrypted password. We do not store passwords in plain text.

b) Usage Data
We automatically collect certain information when you access the Service, including:
- Device type, operating system, and version
- App version and build number
- Session duration and frequency of use
- Features accessed and actions performed within the app
- Crash logs and performance diagnostics

c) Content Data
When you use our summarization and translation features, the text, documents, audio recordings, or images you submit are processed by our AI service providers. This content is transmitted securely and is not permanently stored on our servers after processing is complete.

d) Language Preferences
We store your preferred app language and output language settings locally on your device and in your account profile.`,
  },
  {
    title: '3. How We Use Your Information',
    body: `We use the information we collect for the following purposes:

- To provide, operate, and maintain the Service
- To process your summarization and translation requests
- To manage your account and provide customer support
- To send you service-related notifications (with your consent)
- To monitor usage patterns and improve the Service
- To detect, prevent, and address technical issues and security threats
- To comply with legal obligations

We do not use your content data (text, documents, audio) for training AI models or any purpose other than fulfilling your specific request.`,
  },
  {
    title: '4. Data Retention',
    body: `We follow a strict zero-data-retention policy for content processing:

- Text, documents, and audio submitted for summarization or translation are processed in real-time and are not stored on our servers after the response is delivered to your device.
- Your summarization and translation history is stored locally on your device and can be cleared at any time from the History tab.
- Account data (email, preferences) is retained as long as your account is active.
- If you delete your account, all associated data will be permanently removed within 30 days.
- Usage analytics and crash logs are retained for up to 12 months in anonymized form.`,
  },
  {
    title: '5. Data Sharing and Third Parties',
    body: `We do not sell, rent, or trade your personal information. We may share data with the following categories of third parties:

a) AI Processing Providers
We use OpenAI's API to process your summarization and translation requests. Content sent to OpenAI is subject to their data usage policies. We have configured our integration to disable data retention and training on OpenAI's side.

b) Authentication Services
We use Supabase for secure user authentication and account management. Supabase processes your email and authentication tokens.

c) Analytics Providers
We may use anonymized analytics services to understand app usage patterns. These services do not receive personally identifiable information.

d) Legal Requirements
We may disclose your information if required by law, regulation, legal process, or governmental request.`,
  },
  {
    title: '6. Data Security',
    body: `We implement industry-standard security measures to protect your data:

- All data transmitted between your device and our servers is encrypted using TLS 1.3.
- Passwords are hashed using bcrypt with a strong work factor.
- API keys and sensitive credentials are stored securely in environment variables and are never exposed to client-side code.
- We perform regular security audits and vulnerability assessments.
- Access to production systems is restricted to authorized personnel with multi-factor authentication.

While we strive to protect your personal data, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security.`,
  },
  {
    title: '7. Your Rights and Choices',
    body: `Depending on your jurisdiction, you may have the following rights:

a) Access and Portability
You can request a copy of the personal data we hold about you.

b) Correction
You can update your account information at any time through the app settings.

c) Deletion
You can delete your account and all associated data by contacting our support team or through the app settings.

d) Opt-Out of Notifications
You can disable push notifications at any time through your device settings or the app's notification preferences.

e) Data Processing Objection
You may object to certain processing activities. Contact us at the email below to exercise this right.

For users in the European Economic Area (EEA), you also have the right to lodge a complaint with your local data protection authority.`,
  },
  {
    title: '8. Children\'s Privacy',
    body: `Our Service is not directed to children under the age of 13 (or the applicable age of consent in your jurisdiction). We do not knowingly collect personal information from children. If we become aware that we have collected data from a child without parental consent, we will take steps to delete that information promptly.

If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.`,
  },
  {
    title: '9. International Data Transfers',
    body: `Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from your jurisdiction.

When we transfer data internationally, we ensure appropriate safeguards are in place, including:
- Standard Contractual Clauses approved by the European Commission
- Compliance with applicable data transfer frameworks
- Encryption of data in transit and at rest`,
  },
  {
    title: '10. Cookies and Tracking Technologies',
    body: `Our mobile application does not use cookies. However, we may use the following technologies:

- Local Storage: We use AsyncStorage to save your preferences (theme, language) locally on your device.
- Session Tokens: Authentication tokens are stored securely on your device to maintain your login session.

We do not use advertising trackers or cross-app tracking technologies.`,
  },
  {
    title: '11. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. When we make changes, we will:

- Update the "Last Updated" date at the top of this policy
- Notify you through the app or via email for significant changes
- Provide a summary of key changes

Your continued use of the Service after changes are posted constitutes your acceptance of the revised policy.`,
  },
  {
    title: '12. Contact Us',
    body: `If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

Email: privacy@summalingua.com

We aim to respond to all inquiries within 48 hours.`,
  },
];

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: colors.text }]}>Privacy Policy</Text>
      <Text style={[styles.updated, { color: colors.textSecondary }]}>
        Last updated: {LAST_UPDATED}
      </Text>

      {sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {section.title}
          </Text>
          <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>
            {section.body}
          </Text>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          {COMPANY_NAME} - All rights reserved.
        </Text>
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
  updated: {
    fontSize: 14,
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: -0.1,
  },
  footer: {
    marginTop: 16,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.2)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
  },
});
