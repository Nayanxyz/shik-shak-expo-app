import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MathHtml({ html, className }: { html: string; className?: string }) {
  // FIX: Start at 60, but allow it to grow dynamically based on the HTML content
  const [dynamicHeight, setDynamicHeight] = useState(60);

  const htmlContent = useMemo(() => {
    if (!html) return '';
    let processed = html.replace(/\f/g, '\\f');

