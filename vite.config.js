import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import tailwindcss from '@tailwindcss/vite';

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    sveltekit(),
    tailwindcss(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'saas template kor', // 앱 이름
        short_name: 'stk', // 짧은 앱 이름
        description: 'Saas Template App for Tauri and Svelte', // 앱 설명
        theme_color: '#ffffff', // 테마 색상
        background_color: '#ffffff', // 배경 색상
        display: 'standalone', // PWA 디스플레이 모드
        scope: '/',
        start_url: '/', // 앱 시작 URL
        icons: [
          // 다양한 크기의 앱 아이콘 정의
          {
            src: '/icons/icon-192x192.png', // static 폴더 기준 경로
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable', // 마스크 가능한 아이콘
          }
        ],
        screenshots: [
          {
            src: "/screenshots/home-desktop.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide"
          },
          {
            src: "/screenshots/home-mobile.png",
            sizes: "540x720",
            type: "image/png",
            form_factor: "narrow"
          }
        ]
      },
      // 서비스 워커 설정 (Workbox 사용 시)
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webp,ico}'], // 캐싱할 파일 패턴
        runtimeCaching: [ // 런타임 캐싱 전략
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
