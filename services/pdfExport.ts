import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

function markdownToHtml(markdown: string): string {
  const lines = markdown.split('\n');
  let html = '';

  for (const line of lines) {
    if (line.startsWith('# ')) {
      html += `<h1>${processInline(line.slice(2))}</h1>`;
    } else if (line.startsWith('## ')) {
      html += `<h2>${processInline(line.slice(3))}</h2>`;
    } else if (line.startsWith('### ')) {
      html += `<h3>${processInline(line.slice(4))}</h3>`;
    } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      html += `<li>${processInline(line.trim().slice(2))}</li>`;
    } else if (line.trim() === '') {
      html += '<br/>';
    } else {
      html += `<p>${processInline(line)}</p>`;
    }
  }

  return html;
}

function processInline(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function buildHtmlDocument(content: string, title: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #1a1a1a;
          padding: 48px 40px;
          line-height: 1.6;
          background: #fff;
        }
        .header {
          border-bottom: 2px solid #e5e5ea;
          padding-bottom: 16px;
          margin-bottom: 32px;
        }
        .header h1 {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #8e8e93;
          font-weight: 600;
        }
        .header .date {
          font-size: 11px;
          color: #aeaeb2;
          margin-top: 4px;
        }
        h1 { font-size: 22px; font-weight: 700; margin: 24px 0 12px; color: #111; }
        h2 { font-size: 18px; font-weight: 600; margin: 20px 0 10px; color: #222; }
        h3 { font-size: 15px; font-weight: 600; margin: 16px 0 8px; color: #333; }
        p { font-size: 13px; margin-bottom: 8px; color: #333; line-height: 1.7; }
        li {
          font-size: 13px;
          margin-bottom: 6px;
          margin-left: 20px;
          color: #333;
          line-height: 1.7;
          list-style-type: disc;
        }
        strong { font-weight: 600; }
        .footer {
          border-top: 1px solid #e5e5ea;
          margin-top: 40px;
          padding-top: 16px;
          font-size: 10px;
          color: #aeaeb2;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <div class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      </div>
      ${markdownToHtml(content)}
      <div class="footer">Brieffy</div>
    </body>
    </html>
  `;
}

export async function exportToPdf(content: string, title: string = 'Summary'): Promise<void> {
  const html = buildHtmlDocument(content, title);

  if (Platform.OS === 'web') {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  const isAvailable = await Sharing.isAvailableAsync();

  if (isAvailable) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Export PDF',
      UTI: 'com.adobe.pdf',
    });
  }
}
