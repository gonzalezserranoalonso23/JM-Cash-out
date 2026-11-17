# JM Cash-out

Calculadora para contar efectivo mexicano por denominación. El total se actualiza al instante y el conteo puede exportarse a PDF.

## Requisitos

- Node.js 20.19 o posterior
- pnpm

## Desarrollo

```sh
pnpm install
pnpm dev
```

## Producción

```sh
pnpm build
pnpm preview
```

La aplicación guarda el conteo en el almacenamiento local del navegador. El manifiesto y el service worker habilitan la instalación como PWA y el uso offline después de cargar la aplicación.
