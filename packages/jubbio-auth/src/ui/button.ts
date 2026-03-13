import { JubbioAuth } from '../client';
import { JUBBIO_COLORS, BASE_BUTTON_STYLES, SIZES, type ButtonSize, type ButtonTheme } from './styles';
import { getJubbioLogo } from './logo';

export interface LoginButtonOptions {
  /** Button text (default: "Jubbio ile Giriş Yap") */
  label?: string;
  /** Button size (default: "medium") */
  size?: ButtonSize;
  /** Color theme (default: "brand") */
  theme?: ButtonTheme;
  /** Show Jubbio logo icon (default: true) */
  showLogo?: boolean;
  /** Full width button (default: false) */
  fullWidth?: boolean;
  /** Custom CSS class name */
  className?: string;
  /** Callback after successful login redirect */
  onLogin?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

function getThemeStyles(theme: ButtonTheme): { bg: string; bgHover: string; color: string; logoColor: string } {
  switch (theme) {
    case 'dark':
      return {
        bg: JUBBIO_COLORS.dark,
        bgHover: JUBBIO_COLORS.darkHover,
        color: JUBBIO_COLORS.white,
        logoColor: JUBBIO_COLORS.primary
      };
    case 'light':
      return {
        bg: JUBBIO_COLORS.white,
        bgHover: '#F2F3F5',
        color: '#2E3338',
        logoColor: JUBBIO_COLORS.primary
      };
    case 'brand':
    default:
      return {
        bg: JUBBIO_COLORS.primary,
        bgHover: JUBBIO_COLORS.primaryHover,
        color: JUBBIO_COLORS.white,
        logoColor: JUBBIO_COLORS.white
      };
  }
}

/**
 * Render a "Sign in with Jubbio" button into a container element.
 * Framework-agnostic — works with vanilla JS, jQuery, or any framework.
 */
export function renderLoginButton(
  container: HTMLElement | string,
  auth: JubbioAuth,
  options: LoginButtonOptions = {}
): HTMLButtonElement {
  const {
    label = 'Jubbio ile Giriş Yap',
    size = 'medium',
    theme = 'brand',
    showLogo = true,
    fullWidth = false,
    className = '',
    onLogin,
    onError
  } = options;

  const el = typeof container === 'string' ? document.querySelector<HTMLElement>(container) : container;
  if (!el) throw new Error(`jubbio-auth: Container element not found: ${container}`);

  const sizeConfig = SIZES[size];
  const themeStyles = getThemeStyles(theme);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = `jubbio-login-btn ${className}`.trim();
  button.setAttribute('aria-label', label);

  // Styles
  const borderStyle = theme === 'light' ? 'border: 1px solid #D3D6DA;' : '';
  button.style.cssText = `
    ${BASE_BUTTON_STYLES}
    background-color: ${themeStyles.bg};
    color: ${themeStyles.color};
    font-size: ${sizeConfig.fontSize};
    padding: ${sizeConfig.padding};
    height: ${sizeConfig.height};
    ${fullWidth ? 'width: 100%;' : ''}
    ${borderStyle}
  `;

  // Content
  const logoHtml = showLogo ? `<span style="display:inline-flex;align-items:center;">${getJubbioLogo(sizeConfig.iconSize, themeStyles.logoColor)}</span>` : '';
  button.innerHTML = `${logoHtml}<span>${label}</span>`;

  // Hover effects
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = themeStyles.bgHover;
  });
  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = themeStyles.bg;
  });
  button.addEventListener('mousedown', () => {
    button.style.transform = 'scale(0.98)';
  });
  button.addEventListener('mouseup', () => {
    button.style.transform = 'scale(1)';
  });

  // Click handler
  button.addEventListener('click', async () => {
    try {
      button.disabled = true;
      button.style.opacity = '0.7';
      button.style.cursor = 'wait';
      await auth.login();
      onLogin?.();
    } catch (error) {
      button.disabled = false;
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
      onError?.(error as Error);
    }
  });

  el.appendChild(button);
  return button;
}
