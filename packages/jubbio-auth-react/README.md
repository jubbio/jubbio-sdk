# jubbio-auth-react

Jubbio OAuth2 için React component'leri.

## Kurulum

```bash
npm install jubbio-auth jubbio-auth-react
```

## Kullanım

### 1. Provider ile sar

```jsx
import { JubbioProvider } from 'jubbio-auth-react';

function App() {
  return (
    <JubbioProvider config={{
      clientId: 'APP_CLIENT_ID',
      redirectUri: 'http://localhost:5173/callback',
      scopes: ['identify', 'email']
    }}>
      <Router />
    </JubbioProvider>
  );
}
```

### 2. Login butonu ekle

```jsx
import { JubbioLoginButton } from 'jubbio-auth-react';

function LoginPage() {
  return <JubbioLoginButton />;
}

// Özelleştirmeler
<JubbioLoginButton theme="dark" size="large" />
<JubbioLoginButton theme="light" label="Sign in with Jubbio" />
<JubbioLoginButton fullWidth />
```

### 3. Callback sayfası

```jsx
import { JubbioCallback } from 'jubbio-auth-react';

function CallbackPage() {
  return (
    <JubbioCallback
      successRedirect="/"
      onSuccess={(result) => console.log('Giriş başarılı:', result.user)}
      onError={(err) => console.error('Hata:', err)}
    />
  );
}
```

### 4. Hook ile kullanıcı bilgisi

```jsx
import { useJubbio } from 'jubbio-auth-react';

function Profile() {
  const { user, isLoggedIn, logout } = useJubbio();

  if (!isLoggedIn) return <p>Giriş yapılmamış</p>;

  return (
    <div>
      <p>Hoş geldin, {user?.display_name || user?.username}</p>
      <button onClick={logout}>Çıkış Yap</button>
    </div>
  );
}
```

## Component'ler

### `<JubbioLoginButton />`

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|-----------|----------|
| `label` | string | "Jubbio ile Giriş Yap" | Buton yazısı |
| `size` | "small" \| "medium" \| "large" | "medium" | Boyut |
| `theme` | "brand" \| "dark" \| "light" | "brand" | Renk teması |
| `showLogo` | boolean | true | Logo göster |
| `fullWidth` | boolean | false | Tam genişlik |

### `<JubbioCallback />`

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|-----------|----------|
| `successRedirect` | string | "/" | Başarılı giriş sonrası yönlendirme |
| `redirectDelay` | number | 1500 | Yönlendirme gecikmesi (ms) |
| `onSuccess` | function | - | Başarı callback'i |
| `onError` | function | - | Hata callback'i |
| `loadingComponent` | ReactNode | - | Özel loading UI |
| `successComponent` | function | - | Özel başarı UI |
| `errorComponent` | function | - | Özel hata UI |

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
