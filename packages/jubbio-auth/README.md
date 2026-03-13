# @jubbio/auth

Jubbio OAuth2 SDK — Add "Sign in with Jubbio" to your app.

## Installation

```bash
npm install @jubbio/auth
```

## Quick Start

```js
import { JubbioAuth } from '@jubbio/auth';

const auth = new JubbioAuth({
  clientId: 'YOUR_CLIENT_ID',
  redirectUri: 'https://myapp.com/callback',
  scopes: ['identify', 'email', 'guilds']
});
```

### Login Button

```jsx
<button onClick={() => auth.login()}>
  Sign in with Jubbio
</button>
```

### Callback Page

```js
// On your /callback page
const { user, tokens } = await auth.handleCallback();
console.log(`Welcome, ${user.display_name || user.username}!`);
```

## Built-in UI

### Vanilla JS — Render a login button

```js
import { JubbioAuth, renderLoginButton } from '@jubbio/auth';

const auth = new JubbioAuth({ clientId: '...', redirectUri: '...' });

renderLoginButton('#login-container', auth, {
  label: 'Sign in with Jubbio',
  theme: 'brand',   // 'brand' | 'dark' | 'light'
  size: 'medium'     // 'small' | 'medium' | 'large'
});
```

### Vanilla JS — Handle callback page

```js
import { JubbioAuth, handleCallbackPage } from '@jubbio/auth';

const auth = new JubbioAuth({ clientId: '...', redirectUri: '...' });

handleCallbackPage(auth, {
  successRedirect: '/',
  onSuccess: (result) => console.log('Logged in:', result.user),
  onError: (err) => console.error('Failed:', err)
});
```

## React

For React projects, use [`@jubbio/auth-react`](https://www.npmjs.com/package/@jubbio/auth-react) which provides ready-made components and hooks.

## API

### `new JubbioAuth(config)`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientId` | string | ✅ | OAuth2 Client ID |
| `redirectUri` | string | ✅ | Callback URL |
| `scopes` | string[] | ❌ | Requested scopes (default: `['identify']`) |
| `baseUrl` | string | ❌ | API URL (default: `https://api.jubbio.com`) |
| `popup` | boolean | ❌ | Use popup window (default: `false`) |
| `autoStore` | boolean | ❌ | Store tokens in localStorage (default: `true`) |

### Methods

| Method | Description |
|--------|-------------|
| `login()` | Start the OAuth2 login flow |
| `handleCallback()` | Process callback URL, returns `{ user, tokens }` |
| `getUser()` | Fetch current user info |
| `getGuilds()` | List user's guilds |
| `getConnections()` | Fetch connected accounts |
| `getRelationships()` | Fetch friend list |
| `isLoggedIn()` | Check login status |
| `getAccessToken()` | Get stored access token |
| `refreshToken(secret?)` | Refresh the access token |
| `logout()` | Clear stored tokens |

### Scopes

| Scope | Description |
|-------|-------------|
| `identify` | Username, avatar, ID |
| `email` | Email address |
| `guilds` | Guild list |
| `guilds.members.read` | Guild members |
| `connections` | Connected accounts |
| `relationships.read` | Friend list |

## Security

- PKCE (S256) is used automatically
- CSRF protection via state parameter
- Tokens stored in localStorage
- Access token lifetime: 1 hour
- Refresh token rotation enabled (new token on every refresh)
