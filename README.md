# Jubbio SDK

Jubbio OAuth2 entegrasyonu için resmi SDK paketleri.

## Paketler

| Paket | Açıklama | npm |
|-------|----------|-----|
| [`jubbio-auth`](packages/jubbio-auth) | Core SDK — vanilla JS, framework-agnostic | `npm i jubbio-auth` |
| [`jubbio-auth-react`](packages/jubbio-auth-react) | React component'leri ve hook'lar | `npm i jubbio-auth-react` |

## Geliştirme

```bash
npm install
npm run build
```

## Yapı

```
jubbio-sdk/
├── packages/
│   ├── jubbio-auth/          # Core: PKCE, token management, UI helpers
│   └── jubbio-auth-react/    # React: Provider, LoginButton, Callback, useJubbio
└── package.json              # npm workspaces root
```
