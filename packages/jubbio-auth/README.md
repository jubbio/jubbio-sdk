# jubbio-auth

Jubbio OAuth2 SDK — Uygulamanıza "Jubbio ile Giriş Yap" butonu ekleyin.

## Kurulum

```bash
npm install jubbio-auth
```

## Hızlı Başlangıç

```js
import { JubbioAuth } from 'jubbio-auth';

const auth = new JubbioAuth({
  clientId: 'APP_CLIENT_ID',
  redirectUri: 'https://myapp.com/callback',
  scopes: ['identify', 'email', 'guilds']
});
```

### Giriş Butonu

```jsx
<button onClick={() => auth.login()}>
  Jubbio ile Giriş Yap
</button>
```

### Callback Sayfası

```js
// /callback sayfasında
const { user, tokens } = await auth.handleCallback();
console.log(`Hoşgeldin, ${user.display_name || user.username}!`);
```

## React Örneği

```jsx
import { JubbioAuth } from 'jubbio-auth';
import { useEffect, useState } from 'react';

const auth = new JubbioAuth({
  clientId: 'APP_CLIENT_ID',
  redirectUri: 'http://localhost:5173/callback',
  scopes: ['identify', 'email']
});

// Login butonu
function LoginButton() {
  return (
    <button onClick={() => auth.login()}>
      Jubbio ile Giriş Yap
    </button>
  );
}

// Callback sayfası
function CallbackPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    auth.handleCallback()
      .then(({ user }) => setUser(user))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div>Hata: {error}</div>;
  if (!user) return <div>Giriş yapılıyor...</div>;
  return <div>Hoşgeldin, {user.display_name || user.username}!</div>;
}
```

## API

### `new JubbioAuth(config)`

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `clientId` | string | ✅ | OAuth2 Client ID |
| `redirectUri` | string | ✅ | Callback URL |
| `scopes` | string[] | ❌ | İstenen izinler (varsayılan: `['identify']`) |
| `baseUrl` | string | ❌ | API URL (varsayılan: `https://api.jubbio.com`) |
| `popup` | boolean | ❌ | Popup pencere kullan (varsayılan: `false`) |
| `autoStore` | boolean | ❌ | Token'ları localStorage'a kaydet (varsayılan: `true`) |

### Metodlar

| Metod | Açıklama |
|-------|----------|
| `login()` | OAuth2 giriş akışını başlatır |
| `handleCallback()` | Callback URL'ini işler, `{ user, tokens }` döner |
| `getUser()` | Kullanıcı bilgilerini getirir |
| `getGuilds()` | Kullanıcının sunucularını listeler |
| `getConnections()` | Bağlı hesapları getirir |
| `getRelationships()` | Arkadaş listesini getirir |
| `isLoggedIn()` | Giriş durumunu kontrol eder |
| `getAccessToken()` | Kayıtlı access token'ı döner |
| `refreshToken(secret)` | Token yeniler (server-side) |
| `logout()` | Oturumu kapatır |

### Scope'lar

| Scope | Açıklama |
|-------|----------|
| `identify` | Kullanıcı adı, avatar, ID |
| `email` | E-posta adresi |
| `guilds` | Sunucu listesi |
| `guilds.members.read` | Sunucu üyeleri |
| `connections` | Bağlı hesaplar |
| `relationships.read` | Arkadaş listesi |

## Güvenlik

- PKCE (S256) otomatik kullanılır
- State parametresi ile CSRF koruması
- Token'lar localStorage'da saklanır
- Access token süresi: 1 saat
- Refresh token rotation aktif (her yenilemede yeni token)
