export interface JubbioAuthConfig {
  /** OAuth2 Application Client ID */
  clientId: string;
  /** Callback URL registered in Jubbio Developer Portal */
  redirectUri: string;
  /** Requested OAuth2 scopes */
  scopes?: string[];
  /** Jubbio API base URL for token exchange and resource endpoints (default: https://api.jubbio.com) */
  baseUrl?: string;
  /** Jubbio frontend URL for the consent/authorize page (default: https://jubbio.com) */
  authorizeUrl?: string;
  /** Use popup instead of redirect (default: false) */
  popup?: boolean;
  /** Popup window dimensions */
  popupOptions?: { width?: number; height?: number };
  /** Auto-store tokens in localStorage (default: true) */
  autoStore?: boolean;
  /** localStorage key prefix (default: 'jubbio_') */
  storagePrefix?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface JubbioUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  email?: string;
  created_at: string;
}

export interface JubbioGuild {
  id: string;
  name: string;
  icon_url: string | null;
  owner_id: string;
  member_count: number;
}

export interface CallbackResult {
  user: JubbioUser;
  tokens: TokenResponse;
}

export interface PKCEPair {
  verifier: string;
  challenge: string;
}
