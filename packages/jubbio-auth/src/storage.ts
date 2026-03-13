import type { TokenResponse } from './types';

export class TokenStorage {
  private prefix: string;

  constructor(prefix = 'jubbio_') {
    this.prefix = prefix;
  }

  private key(name: string): string {
    return `${this.prefix}${name}`;
  }

  saveTokens(tokens: TokenResponse): void {
    const expiresAt = Date.now() + tokens.expires_in * 1000;
    localStorage.setItem(this.key('access_token'), tokens.access_token);
    localStorage.setItem(this.key('refresh_token'), tokens.refresh_token);
    localStorage.setItem(this.key('expires_at'), expiresAt.toString());
    localStorage.setItem(this.key('scope'), tokens.scope);
  }

  getAccessToken(): string | null {
    const expiresAt = localStorage.getItem(this.key('expires_at'));
    if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
      return null; // expired
    }
    return localStorage.getItem(this.key('access_token'));
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.key('refresh_token'));
  }

  isLoggedIn(): boolean {
    return this.getAccessToken() !== null || this.getRefreshToken() !== null;
  }

  clear(): void {
    localStorage.removeItem(this.key('access_token'));
    localStorage.removeItem(this.key('refresh_token'));
    localStorage.removeItem(this.key('expires_at'));
    localStorage.removeItem(this.key('scope'));
  }

  /** Save PKCE verifier + state for callback verification */
  saveAuthState(state: string, verifier: string): void {
    sessionStorage.setItem(this.key('state'), state);
    sessionStorage.setItem(this.key('verifier'), verifier);
  }

  getAuthState(): { state: string | null; verifier: string | null } {
    return {
      state: sessionStorage.getItem(this.key('state')),
      verifier: sessionStorage.getItem(this.key('verifier'))
    };
  }

  clearAuthState(): void {
    sessionStorage.removeItem(this.key('state'));
    sessionStorage.removeItem(this.key('verifier'));
  }
}
