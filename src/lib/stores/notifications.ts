import { writable, get } from 'svelte/store';

export const notificationCount = writable(0);

let originalTitle = document.title;
let originalFavicon = '/favicon.png';

function reset() {
  notificationCount.set(0);
  document.title = originalTitle;
  navigator.clearAppBadge();

  let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/png';
  link.href = originalFavicon;
}

function setBadge() {
  notificationCount.update((count) => count + 1);
  const count = get(notificationCount);
  navigator.setAppBadge(count);
  document.title = `(${count}) ${originalTitle}`;

  const canvas = document.createElement('canvas');
  const img = document.createElement('img');
  img.src = originalFavicon;

  img.onload = () => {
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, 64, 64);

    // 뱃지
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(56, 8, 8, 0, 2 * Math.PI);
    ctx.fill();

    const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (favicon) favicon.href = canvas.toDataURL('image/png');
  };
}

// 탭 포커스되면 초기화
export function listenToVisibility() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden') {
      reset();
    }
  });

  navigator.serviceWorker?.addEventListener('message', (event) => {
    if (event.data?.type === 'NEW_NOTIFICATION') {
      setBadge();
    }
  });
}
