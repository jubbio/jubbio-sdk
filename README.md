# Jubbio SDK

Official SDK packages for Jubbio OAuth2 integration.

## Packages

| Package | Description | Install |
|---------|-------------|---------|
| [`@jubbio/auth`](packages/jubbio-auth) | Core SDK — vanilla JS, framework-agnostic | `npm i @jubbio/auth` |
| [`@jubbio/auth-react`](packages/jubbio-auth-react) | React components and hooks | `npm i @jubbio/auth-react` |

## Development

```bash
npm install
npm run build
```

## Structure

```
jubbio-sdk/
├── packages/
│   ├── jubbio-auth/          # Core: PKCE, token management, UI helpers
│   └── jubbio-auth-react/    # React: Provider, LoginButton, Callback, useJubbio
└── package.json              # npm workspaces root
```
