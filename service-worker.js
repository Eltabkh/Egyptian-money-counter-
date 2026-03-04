here// ===============================
// Service Worker للتطبيق الذكي للعداد النقدي
// جميع الحقوق محفوظة © 2026 ENG Kareem Ahmed
// ===============================

// اسم الكاش والإصدار - غير الرقم عند تحديث الملفات
const CACHE_NAME = 'cash-counter-v1.0.0';

// الملفات التي سيتم تخزينها في الكاش عند التثبيت
const urlsToCache = [
  '/', // الصفحة الرئيسية
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-brands-400.woff2'
];

// مرحلة التثبيت: تخزين كل الملفات الأساسية
self.addEventListener('install', event => {
  console.log('✅ Service Worker: التثبيت جاري...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Service Worker: تم فتح الكاش، جاري تخزين الملفات...');
        return cache.addAll(urlsToCache).then(() => {
          console.log('✅ Service Worker: تم تخزين جميع الملفات بنجاح');
        });
      })
      .catch(error => {
        console.error('❌ Service Worker: فشل تخزين بعض الملفات', error);
      })
  );
  // Force waiting service worker to become active
  self.skipWaiting();
});

// مرحلة التفعيل: تنظيف الكاشات القديمة
self.addEventListener('activate', event => {
  console.log('✅ Service Worker: التفعيل جاري...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('✅ Service Worker: حذف كاش قديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: التفعيل اكتمل، التحكم في الصفحات غير الخاضعة للسيطرة');
      return self.clients.claim();
    })
  );
});

// استراتيجية الجلب: محاولة من الشبكة أولاً، فإن فشلت من الكاش (Network First)
self.addEventListener('fetch', event => {
  // تجاهل طلبات chrome-extension أو data:
  if (event.request.url.startsWith('chrome-extension://') || 
      event.request.url.includes('extension') ||
      event.request.method !== 'GET') {
    return;
  }

  // تجاهل طلبات التحليلات (إذا وجدت)
  if (event.request.url.includes('analytics') || event.request.url.includes('google')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // إذا نجح الاتصال، خزن نسخة في الكاش (فقط للملفات الناجحة)
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // إذا فشل الاتصال، ابحث في الكاش
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            // إذا لم يوجد في الكاش أيضاً، نعيد صفحة بسيطة (اختياري)
            // يمكن إرجاع صفحة offline.html إذا كانت موجودة
            if (event.request.url.includes('.html')) {
              return caches.match('/offline.html');
            }
            return new Response('غير متصل حالياً والمورد غير متوفر في الكاش.', {
              status: 404,
              statusText: 'Not Found'
            });
          });
      })
  );
});
