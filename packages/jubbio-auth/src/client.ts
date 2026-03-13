import type {
  JubbioAuthConfig,
  TokenResponse,
  JubbioUser,
  JubbioGuild,
  CallbackResult
} from './types';
import { generatePKCE, generateState } from './pkce';
import { TokenStorage } from './storage';

const DEFAULT_BASE_URL = 'https://api.jubbio.com';
const DEFAULT_SCOPES = ['identify'];

export class JubbioAuth {
  private config: Required<
    Pick<JubbioAuthConfig, 'clientId' | 'redirectUri' | 'baseUrl' | 'autoStore' | 'storagePrefix'>
  > & JubbioAuthConfig;
  private storage: TokenStorage;

  constructor(config: JubbioAuthConfig) {
    if (!config.clientId) throw new Error('jubbio-auth: clientId is required');
    if (!config.redirectUri) throw new Error('jubbio-auth: redirectUri is required');

    this.config = {
      baseUrl: DEFAULT_BASE_URL,
      scopes: DEFAULT_SCOPES,
      popup: false,
      autoStore: true,
      storagePrefix: 'jubbio_',
      ...config
    };

    this.storage = new TokenStorage(this.config.storagePrefix);
  }

  // ─── Login Flow ───

  /** Start OAuth2 login — redirects user to Jubbio authorization page */
  async login(): Promise<void> {
    const { verifier, challenge } = await generatePKCE();
    const state = generateState();

    // Save for callback verification
    this.storage.saveAuthState(state, verifier);

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: (this.config.scopes || DEFAULT_SCOPES).join(' '),
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256'
    });

    const url = `${this.config.baseUrl}/api/v1/oauth2/authorize?${params.toString()}`;

    if (this.config.popup) {
      this.openPopup(url);
    } else {
      window.location.href = url;
    }
  }

  /** Handle the OAuth2 callback — call this on your redirect_uri page */
  async handleCallback(callbackUrl?: string): Promise<CallbackResult> {
    const url = new URL(callbackUrl || window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      const desc = url.searchParams.get('error_description') || error;
      throw new JubbioAuthError(error, desc);
    }

    if (!code) {
      throw new JubbioAuthError('missing_code', 'No authorization code in callback URL');
    }

    // Verify state (CSRF protection)
    const saved = this.storage.getAuthState();
    if (!saved.state || saved.state !== state) {
      throw new JubbioAuthError('state_mismatch', 'State parameter does not match. Possible CSRF attack.');
    }

    if (!saved.verifier) {
      throw new JubbioAuthError('missing_verifier', 'PKCE verifier not found. Did you call login() first?');
    }

    // Exchange code for tokens
    const tokens = await this.exchangeCode(code, saved.verifier);

    // Cleanup
    this.storage.clearAuthState();

    // Store tokens
    if (this.config.autoStore) {
      this.storage.saveTokens(tokens);
    }

    // Fetch user info
    const user = await this.getUser(tokens.access_token);

    // Clean URL (remove code & state from address bar)
    if (typeof window !== 'undefined' && window.history) {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('code');
      cleanUrl.searchParams.delete('state');
      window.history.replaceState({}, '', cleanUrl.toString());
    }

    return { user, tokens };
  }

  // ─── Token Exchange ───

  private async exchangeCode(code: string, codeVerifier: string): Promise<TokenResponse> {
    const res = await fetch(`${this.config.baseUrl}/api/v1/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
        code_verifier: codeVerifier
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new JubbioAuthError(
        err.error || 'token_exchange_failed',
        err.error_description || `Token exchange failed (${res.status})`
      );
    }

    return res.json();
  }

  /** 
   * Refresh the access token using stored refresh token.
   * For public clients (SPA/mobile), clientSecret is not needed.
   * For confidential clients (server-side), pass clientSecret.
   */
  async refreshToken(clientSecret?: string): Promise<TokenResponse> {
    const refreshToken = this.storage.getRefreshToken();
    if (!refreshToken) {
      throw new JubbioAuthError('no_refresh_token', 'No refresh token available');
    }

    const body: Record<string, string> = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId
    };

    if (clientSecret) {
      body.client_secret = clientSecret;
    }

    const res = await fetch(`${this.config.baseUrl}/api/v1/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 400 || res.status === 401) {
        this.storage.clear(); // Token is invalid, clear everything
      }
      throw new JubbioAuthError(
        err.error || 'refresh_failed',
        err.error_description || `Token refresh failed (${res.status})`
      );
    }

    const tokens: TokenResponse = await res.json();

    if (this.config.autoStore) {
      this.storage.saveTokens(tokens);
    }

    return tokens;
  }

  // ─── API Methods ───

  /** Get current user info */
  async getUser(accessToken?: string): Promise<JubbioUser> {
    return this.apiGet<JubbioUser>('/api/v1/oauth2/users/@me', accessToken);
  }

  /** Get current user's guilds */
  async getGuilds(accessToken?: string): Promise<JubbioGuild[]> {
    return this.apiGet<JubbioGuild[]>('/api/v1/oauth2/users/@me/guilds', accessToken);
  }

  /** Get current user's connections */
  async getConnections(accessToken?: string): Promise<any[]> {
    return this.apiGet<any[]>('/api/v1/oauth2/users/@me/connections', accessToken);
  }

  /** Get current user's relationships (friends) */
  async getRelationships(accessToken?: string): Promise<any[]> {
    return this.apiGet<any[]>('/api/v1/oauth2/users/@me/relationships', accessToken);
  }

  private async apiGet<T>(path: string, accessToken?: string): Promise<T> {
    const token = accessToken || this.storage.getAccessToken();
    if (!token) {
      throw new JubbioAuthError('not_authenticated', 'No access token available. Call login() first.');
    }

    const res = await fetch(`${this.config.baseUrl}${path}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new JubbioAuthError(
        err.error || 'api_error',
        err.error_description || err.message || `API request failed (${res.status})`
      );
    }

    return res.json();
  }

  // ─── Session Helpers ───

  /** Check if user is logged in (has valid or refreshable token) */
  isLoggedIn(): boolean {
    return this.storage.isLoggedIn();
  }

  /** Get stored access token (null if expired) */
  getAccessToken(): string | null {
    return this.storage.getAccessToken();
  }

  /** Logout — clear stored tokens */
  logout(): void {
    this.storage.clear();
  }

  // ─── Popup Flow ───

  private openPopup(url: string): void {
    const w = this.config.popupOptions?.width || 500;
    const h = this.config.popupOptions?.height || 700;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;

    const popup = window.open(
      url,
      'jubbio-auth',
      `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no`
    );

    if (!popup) {
      // Popup blocked — fallback to redirect
      window.location.href = url;
    }
  }
}

// ─── Error Class ───

export class JubbioAuthError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'JubbioAuthError';
    this.code = code;
  }
}
