import localforage from 'localforage';

const OFFLINE_QUEUE_KEY = 'offline-queue';

export async function storeOfflineRequest(data: any) {
  const queue = (await localforage.getItem<any[]>(OFFLINE_QUEUE_KEY)) || [];
  queue.push({ data, timestamp: Date.now() });
  await localforage.setItem(OFFLINE_QUEUE_KEY, queue);
}

export async function syncWithServer() {
  const queue = (await localforage.getItem<any[]>(OFFLINE_QUEUE_KEY)) || [];

  if (queue.length === 0) return;

  const successful: any[] = [];

  for (const item of queue) {
    try {
      // 여기를 너의 실제 API로 바꿔야 함
      // await fetch('/api/sync', {
      //   method: 'POST',
      //   body: JSON.stringify(item.data),
      //   headers: { 'Content-Type': 'application/json' }
      // });
      console.log('싱크 성공:', item.data);
      successful.push(item);
    } catch (e) {
      console.warn('싱크 실패:', e);
    }
  }

  // 성공한 것만 제거
  const remaining = queue.filter(item => !successful.includes(item));
  await localforage.setItem(OFFLINE_QUEUE_KEY, remaining);
}

// sync, preodic sync register
export async function registerSyncEvent() {
  try {
    const registration = await navigator.serviceWorker.ready as ServiceWorkerRegistration & { sync?: any };
    await registration.sync.register('sync-queue');
    console.log('📡 Background sync registered!');
  } catch (err) {
    console.error('📵 Background sync registration failed:', err);
  }

  try {
    const registration = await navigator.serviceWorker.ready as ServiceWorkerRegistration & { periodicSync?: any };
    await registration.periodicSync.register('periodic-sync-queue', {
      minInterval: 12 * 60 * 60 * 1000,
    });
    console.log('🔁 Periodic Sync registered!');
  } catch (err) {
    console.error('⚠️ Periodic Sync 등록 실패:', err);
  }
}

export async function saveQueue(event: Event) {
  const data = { title: "임시 데이터" };
  try {
    // await fetch("/api/sync", { method: "POST", body: JSON.stringify(data) });
    throw new Error("서버 연결 실패");
  } catch (e) {
    console.warn("서버 연결 실패, 로컬 저장으로 전환!");
    await storeOfflineRequest(data);
  }
}