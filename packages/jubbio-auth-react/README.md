# @jubbio/auth-react

React components for Jubbio OAuth2 authentication.

## Installation

```bash
npm install @jubbio/auth @jubbio/auth-react
```

## Usage

### 1. Wrap your app with the provider

```jsx
import { JubbioProvider } from '@jubbio/auth-react';

function App() {
  return (
    <JubbioProvider config={{
      clientId: 'YOUR_CLIENT_ID',
      redirectUri: 'http://localhost:5173/callback',
      scopes: ['identify', 'email']
    }}>
      <Router />
    </JubbioProvider>
  );
}
```

### 2. Add a login button

```jsx
import { JubbioLoginButton } from '@jubbio/auth-react';

function LoginPage() {
  return <JubbioLoginButton />;
}

// Customization
<JubbioLoginButton theme="dark" size="large" />
<JubbioLoginButton theme="light" label="Sign in with Jubbio" />
<JubbioLoginButton fullWidth />
```

### 3. Handle the callback

```jsx
import { JubbioCallback } from '@jubbio/auth-react';

function CallbackPage() {
  return (
    <JubbioCallback
      successRedirect="/"
      onSuccess={(result) => console.log('Logged in:', result.user)}
      onError={(err) => console.error('Error:', err)}
    />
  );
}
```

### 4. Access user data with the hook

```jsx
import { useJubbio } from '@jubbio/auth-react';

function Profile() {
  const { user, isLoggedIn, logout } = useJubbio();

  if (!isLoggedIn) return <p>Not logged in</p>;

  return (
    <div>
      <p>Welcome, {user?.display_name || user?.username}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

## Components

### `<JubbioLoginButton />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | "Jubbio ile Giriş Yap" | Button text |
| `size` | "small" \| "medium" \| "large" | "medium" | Size variant |
| `theme` | "brand" \| "dark" \| "light" | "brand" | Color theme |
| `showLogo` | boolean | true | Show Jubbio logo |
| `fullWidth` | boolean | false | Full width button |

### `<JubbioCallback />`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `successRedirect` | string | "/" | Redirect URL after success |
| `redirectDelay` | number | 1500 | Delay before redirect (ms) |
| `onSuccess` | function | — | Success callback |
| `onError` | function | — | Error callback |
| `loadingComponent` | ReactNode | — | Custom loading UI |
| `successComponent` | function | — | Custom success UI |
| `errorComponent` | function | — | Custom error UI |

### `useJubbio()` Hook

```ts
const {
  auth,       // JubbioAuth instance
  user,       // JubbioUser | null
  isLoggedIn, // boolean
  isLoading,  // boolean
  login,      // () => Promise<void>
  logout      // () => void
} = useJubbio();
```
