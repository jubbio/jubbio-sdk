/** Jubbio brand colors and base styles */
export const JUBBIO_COLORS = {
  primary: '#5865F2',
  primaryHover: '#4752C4',
  primaryActive: '#3C45A5',
  white: '#FFFFFF',
  text: '#FFFFFF',
  textSecondary: '#B5BAC1',
  dark: '#1E1F22',
  darkHover: '#2B2D31',
  danger: '#ED4245',
  success: '#57F287'
} as const;

export const BASE_BUTTON_STYLES = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-weight: 600;
  transition: background-color 0.17s ease, transform 0.1s ease;
  text-decoration: none;
  line-height: 1;
  box-sizing: border-box;
`;

export const SIZES = {
  small: { padding: '8px 16px', fontSize: '13px', iconSize: 16, height: '32px' },
  medium: { padding: '10px 20px', fontSize: '14px', iconSize: 20, height: '40px' },
  large: { padding: '14px 28px', fontSize: '16px', iconSize: 24, height: '48px' }
} as const;

export type ButtonSize = keyof typeof SIZES;
export type ButtonTheme = 'brand' | 'dark' | 'light';
