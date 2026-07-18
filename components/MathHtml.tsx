import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MathHtml({ html, className }: { html: string; className?: string }) {
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
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
        <style>
          body {
            background-color: transparent;
            color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 16px;
            /* 🚨 Force long plain-text biology words to wrap */
            overflow-wrap: break-word;
            word-wrap: break-word;
            word-break: break-word;
          }
          /* 🚨 Wrap the content in a measurable box */
          #measure-wrapper {
            padding: 4px;
            display: inline-block;
            width: 100%;
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        <div id="measure-wrapper">${processed}</div>
        
        <script>
          // Send the height of the wrapper DIV, not the buggy document body
          function sendHeight() {
            var wrapper = document.getElementById('measure-wrapper');
            if (wrapper) {
              window.ReactNativeWebView.postMessage(wrapper.offsetHeight);
            }
          }

          window.onload = function() {
            if (window.renderMathInElement) {
              renderMathInElement(document.body, {
                delimiters: [
                  {left: '$$', right: '$$', display: true},
                  {left: '$', right: '$', display: false},
                  {left: '\\(', right: '\\)', display: false},
                  {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false
              });
            }
            
            // Fire layout calculations
            sendHeight();
            setTimeout(sendHeight, 100);
            setTimeout(sendHeight, 400);
            
            // 🚨 Use ResizeObserver to catch any text reflows instantly
            if (window.ResizeObserver) {
               var ro = new ResizeObserver(sendHeight);
               ro.observe(document.getElementById('measure-wrapper'));
            }
          };
        </script>
      </body>
      </html>
    `;
  }, [html]);

  return (
    // 🚨 We cap the max height at 350px. If it goes taller, the box becomes scrollable!
    <View className={className} style={{ height: dynamicHeight, maxHeight: 350, width: '100%' }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        // 🚨 Enable native scrolling inside the WebView for long biology text
        scrollEnabled={true} 
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={true}
        overScrollMode="never"
        onMessage={(event) => {
          const contentHeight = Number(event.nativeEvent.data);
          if (contentHeight > 0) {
            setDynamicHeight(contentHeight + 25); // 25px buffer prevents bottom cutoffs
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webview: {
    backgroundColor: 'transparent',
  },
});