import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MathHtml({ html, className }: { html: string; className?: string }) {
  // FIX: Start at 60, but allow it to grow dynamically based on the HTML content
  const [dynamicHeight, setDynamicHeight] = useState(60);

  const htmlContent = useMemo(() => {
    if (!html) return '';
    let processed = html.replace(/\f/g, '\\f');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js" 
                onload="renderMathInElement(document.body); window.ReactNativeWebView.postMessage(document.body.scrollHeight);"></script>
        <style>
          body {
            background-color: transparent;
            color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 16px;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <div>${processed}</div>
        <script>
          // Fallback height update in case math takes slightly longer to render
          setTimeout(() => {
             window.ReactNativeWebView.postMessage(document.body.scrollHeight);
          }, 500);
        </script>
      </body>
      </html>
    `;
  }, [html]);

