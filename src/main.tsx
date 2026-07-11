import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import './styles/fonts.css';
import { initializePerformanceOptimizations } from './utils/performanceOptimizations';
import { initializePreloader } from './utils/preloadStrategies';

// Version check: reload once if build-id.json doesn't match cached version
if (import.meta.env.PROD) {
  const BUILD_ID_KEY = 'netbond-build-id';
  fetch('./build-id.json', { cache: 'no-store' })
    .then((r) => r.json())
    .then(({ id }) => {
      const cached = sessionStorage.getItem(BUILD_ID_KEY);
      if (cached && cached !== id) {
        sessionStorage.setItem(BUILD_ID_KEY, id);
        window.location.reload();
      } else {
        sessionStorage.setItem(BUILD_ID_KEY, id);
      }
    })
    .catch(() => {});
}

// Initialize performance optimizations
initializePerformanceOptimizations();

// Auto-reload once when a lazy chunk fails to load (stale cache after deploy)
window.addEventListener('error', (e) => {
  if (e.message?.includes('Failed to fetch dynamically imported module') ||
      e.message?.includes('Loading chunk') ||
      e.message?.includes('Loading CSS chunk')) {
    const reloaded = sessionStorage.getItem('chunk-reload');
    if (!reloaded) {
      sessionStorage.setItem('chunk-reload', '1');
      window.location.reload();
    }
  }
});
window.addEventListener('unhandledrejection', (e) => {
  const msg = e.reason?.message || '';
  if (msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Loading chunk')) {
    const reloaded = sessionStorage.getItem('chunk-reload');
    if (!reloaded) {
      sessionStorage.setItem('chunk-reload', '1');
      window.location.reload();
    }
  }
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found!');
} else {
  try {
    const root = createRoot(rootElement);

    // Use HashRouter for file:// protocol compatibility (flash drive usage)
    root.render(
      <HashRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </HashRouter>
    );
    
    // Initialize intelligent preloading after initial render
    document.addEventListener('DOMContentLoaded', () => {
      if (import.meta.env.PROD) {
        setTimeout(() => {
          initializePreloader();
        }, 1000);
      }
    });
  } catch (error) {
    console.error('Failed to render app:', error);
    
    // Minimal fallback
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'padding:20px;margin:40px auto;max-width:600px;text-align:center;background:white;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);';
    errorDiv.innerHTML = `
      <h1 style="color:#e11d48;margin-bottom:16px;">Application Error</h1>
      <p style="margin-bottom:24px;color:#4b5563;">Please refresh the page.</p>
      <button onclick="window.location.reload()" style="background:#003184;color:white;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">Refresh</button>
    `;
    rootElement.appendChild(errorDiv);
  }
}

// Minimal polyfills
if (!window.requestIdleCallback) {
  window.requestIdleCallback = (callback) => setTimeout(callback, 1);
  window.cancelIdleCallback = clearTimeout;
}

// Optimized toast fallback
if (!window.addToast) {
  window.addToast = () => {};
}