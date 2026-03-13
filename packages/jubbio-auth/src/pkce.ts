import type { PKCEPair } from './types';

/** Generate a cryptographically random code verifier (43-128 chars) */
function generateVerifier(length = 64): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64UrlEncode(array).slice(0, length);
}

/** SHA-256 hash then base64url encode */
async function sha256(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

function base64UrlEncode(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Generate a PKCE verifier + S256 challenge pair */
export async function generatePKCE(): Promise<PKCEPair> {
  const verifier = generateVerifier();
  const challenge = await sha256(verifier);
  return { verifier, challenge };
}

/** Generate a random state string for CSRF protection */
export function generateState(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64UrlEncode(array).slice(0, length);
}
