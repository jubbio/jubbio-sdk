import { JubbioAuth, JubbioAuthError } from '../client';
import { JUBBIO_COLORS } from './styles';
import type { CallbackResult } from '../types';

export interface CallbackHandlerOptions {
  /** Show a loading spinner while processing (default: true) */
  showLoading?: boolean;
  /** Redirect URL after successful login (default: '/') */
  successRedirect?: string;
  /** Auto-redirect after success (default: true) */
  autoRedirect?: boolean;
  /** Delay before redirect in ms (default: 1500) */
  redirectDelay?: number;
  /** Callback on success */
  onSuccess?: (result: CallbackResult) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Handle the OAuth2 callback page automatically.
 * Shows loading state, processes the callback, then redirects or calls onSuccess.
 */
export async function handleCallbackPage(
  auth: JubbioAuth,
  options: CallbackHandlerOptions = {}
): Promise<CallbackResult | null> {
  const {
    showLoading = true,
    successRedirect = '/',
    autoRedirect = true,
    redirectDelay = 1500,
    onSuccess,
    onError
  } = options;

  let overlay: HTMLDivElement | null = null;

  if (showLoading) {
    overlay = createLoadingOverlay();
    document.body.appendChild(overlay);
  }

  try {
    const result = await auth.handleCallback();

    if (overlay) {
      showSuccess(overlay, result.user.display_name || result.user.username);
    }

    onSuccess?.(result);

    if (autoRedirect) {
      await delay(redirectDelay);
      window.location.href = successRedirect;
    }

    return result;
  } catch (error) {
    if (overlay) {
      showError(overlay, (error as Error).message);
    }
    onError?.(error as Error);
    return null;
  }
}

function createLoadingOverlay(): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.id = 'jubbio-callback-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 99999;
    display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px;
    background: ${JUBBIO_COLORS.dark};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: ${JUBBIO_COLORS.white};
  `;
  overlay.innerHTML = `
    <div class="jubbio-spinner" style="
      width: 40px; height: 40px;
      border: 3px solid ${JUBBIO_COLORS.textSecondary};
      border-top-color: ${JUBBIO_COLORS.primary};
      border-radius: 50%;
      animation: jubbio-spin 0.8s linear infinite;
    "></div>
    <p style="font-size: 16px; margin: 0; color: ${JUBBIO_COLORS.textSecondary};">Giriş yapılıyor...</p>
    <style>@keyframes jubbio-spin { to { transform: rotate(360deg); } }</style>
  `;
  return overlay;
}

function showSuccess(overlay: HTMLDivElement, name: string): void {
  overlay.innerHTML = `
    <div style="font-size: 48px;">✓</div>
    <p style="font-size: 18px; font-weight: 600; margin: 0;">Hoş geldin, ${escapeHtml(name)}!</p>
    <p style="font-size: 14px; margin: 0; color: ${JUBBIO_COLORS.textSecondary};">Yönlendiriliyorsun...</p>
  `;
}

function showError(overlay: HTMLDivElement, message: string): void {
  overlay.innerHTML = `
    <div style="font-size: 48px;">✕</div>
    <p style="font-size: 18px; font-weight: 600; margin: 0; color: ${JUBBIO_COLORS.danger};">Giriş başarısız</p>
    <p style="font-size: 14px; margin: 0; color: ${JUBBIO_COLORS.textSecondary};">${escapeHtml(message)}</p>
  `;
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
