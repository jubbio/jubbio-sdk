import { useCallback, useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import { useJubbio } from './context';

// ─── Brand Colors ───

const COLORS = {
  primary: '#5865F2',
  primaryHover: '#4752C4',
  white: '#FFFFFF',
  dark: '#1E1F22',
  darkHover: '#2B2D31',
  textSecondary: '#B5BAC1',
  danger: '#ED4245'
};

const SIZES = {
  small:  { padding: '8px 16px',  fontSize: '13px', iconSize: 16, height: '32px' },
  medium: { padding: '10px 20px', fontSize: '14px', iconSize: 20, height: '40px' },
  large:  { padding: '14px 28px', fontSize: '16px', iconSize: 24, height: '48px' }
};

// ─── Logo SVG ───

function JubbioLogo({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
        fill={color}
      />
    </svg>
  );
}

// ─── Login Button ───

export interface JubbioLoginButtonProps {
  /** Button text */
  label?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Color theme */
  theme?: 'brand' | 'dark' | 'light';
  /** Show Jubbio logo */
  showLogo?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Extra class name */
  className?: string;
  /** Extra inline styles */
  style?: CSSProperties;
  /** Custom children (overrides label + logo) */
  children?: ReactNode;
  /** Disabled state */
  disabled?: boolean;
}

export function JubbioLoginButton({
  label = 'Jubbio ile Giriş Yap',
  size = 'medium',
  theme = 'brand',
  showLogo = true,
  fullWidth = false,
  className = '',
  style,
  children,
  disabled
}: JubbioLoginButtonProps) {
  const { login, isLoading } = useJubbio();
  const sizeConfig = SIZES[size];

  const themeMap = {
    brand: { bg: COLORS.primary, hover: COLORS.primaryHover, color: COLORS.white, logoColor: COLORS.white, border: 'none' },
    dark:  { bg: COLORS.dark, hover: COLORS.darkHover, color: COLORS.white, logoColor: COLORS.primary, border: 'none' },
    light: { bg: COLORS.white, hover: '#F2F3F5', color: '#2E3338', logoColor: COLORS.primary, border: '1px solid #D3D6DA' }
  };
  const t = themeMap[theme];

  const handleClick = useCallback(() => { login(); }, [login]);

  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: t.border,
    borderRadius: '8px',
    cursor: isLoading || disabled ? 'wait' : 'pointer',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: 600,
    transition: 'background-color 0.17s ease, transform 0.1s ease',
    backgroundColor: t.bg,
    color: t.color,
    fontSize: sizeConfig.fontSize,
    padding: sizeConfig.padding,
    height: sizeConfig.height,
    width: fullWidth ? '100%' : undefined,
    opacity: isLoading || disabled ? 0.7 : 1,
    ...style
  };

  return (
    <button
      type="button"
      className={`jubbio-login-btn ${className}`.trim()}
      style={baseStyle}
      onClick={handleClick}
      disabled={isLoading || disabled}
      aria-label={label}
      onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = t.hover; }}
      onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = t.bg; }}
    >
      {children ?? (
        <>
          {showLogo && <JubbioLogo size={sizeConfig.iconSize} color={t.logoColor} />}
          <span>{isLoading ? 'Yükleniyor...' : label}</span>
        </>
      )}
    </button>
  );
}

// ─── Callback Handler ───

export interface JubbioCallbackProps {
  /** Redirect after success (default: '/') */
  successRedirect?: string;
  /** Redirect delay in ms (default: 1500) */
  redirectDelay?: number;
  /** Custom loading component */
  loadingComponent?: ReactNode;
  /** Custom success component */
  successComponent?: (username: string) => ReactNode;
  /** Custom error component */
  errorComponent?: (error: string) => ReactNode;
  /** Callback on success */
  onSuccess?: (result: any) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export function JubbioCallback({
  successRedirect = '/',
  redirectDelay = 1500,
  loadingComponent,
  successComponent,
  errorComponent,
  onSuccess,
  onError
}: JubbioCallbackProps) {
  const { auth, setUser } = useJubbio();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    auth.handleCallback()
      .then(result => {
        setUser(result.user);
        setUsername(result.user.display_name || result.user.username);
        setStatus('success');
        onSuccess?.(result);
        setTimeout(() => { window.location.href = successRedirect; }, redirectDelay);
      })
      .catch(err => {
        setErrorMsg(err.message);
        setStatus('error');
        onError?.(err);
      });
  }, []);

  const overlayStyle: CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 99999,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px',
    background: COLORS.dark,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: COLORS.white
  };

  if (status === 'loading') {
    return loadingComponent ? <>{loadingComponent}</> : (
      <div style={overlayStyle}>
        <div style={{
          width: 40, height: 40,
          border: `3px solid ${COLORS.textSecondary}`,
          borderTopColor: COLORS.primary,
          borderRadius: '50%',
          animation: 'jubbio-spin 0.8s linear infinite'
        }} />
        <p style={{ fontSize: 16, margin: 0, color: COLORS.textSecondary }}>Giriş yapılıyor...</p>
        <style>{`@keyframes jubbio-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (status === 'success') {
    return successComponent ? <>{successComponent(username)}</> : (
      <div style={overlayStyle}>
        <div style={{ fontSize: 48 }}>✓</div>
        <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Hoş geldin, {username}!</p>
        <p style={{ fontSize: 14, margin: 0, color: COLORS.textSecondary }}>Yönlendiriliyorsun...</p>
      </div>
    );
  }

  return errorComponent ? <>{errorComponent(errorMsg)}</> : (
    <div style={overlayStyle}>
      <div style={{ fontSize: 48 }}>✕</div>
      <p style={{ fontSize: 18, fontWeight: 600, margin: 0, color: COLORS.danger }}>Giriş başarısız</p>
      <p style={{ fontSize: 14, margin: 0, color: COLORS.textSecondary }}>{errorMsg}</p>
    </div>
  );
}
