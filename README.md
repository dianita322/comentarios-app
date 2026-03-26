# Comentarios App

Aplicación web construida con Next.js + Supabase.

Actualmente incluye:

- autenticación con correo y contraseña
- creación de cuenta
- recuperación y cambio de contraseña
- feed de comentarios
- respuestas
- reacciones
- imágenes
- perfil de usuario

## Tecnologías usadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

## Rutas principales

- `/` → página de inicio
- `/feed` → feed de comentarios
- `/account` → cuenta del usuario autenticado
- `/auth/login` → iniciar sesión
- `/auth/sign-up` → registro
- `/auth/forgot-password` → recuperar contraseña
- `/auth/update-password` → cambiar contraseña desde enlace de correo

## Variables de entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=TU_URL_DE_SUPABASE
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_ANON_KEY
```

## Ejecutar en local

```bash
npm install
npm run dev
```

Luego abre:

```bash
http://localhost:3000
```

## Estado actual del proyecto

Esta base empezó como una app de comentarios, pero será ampliada por fases para convertirse en una plataforma más completa con:

- publicaciones tipo blog
- imágenes y videos
- secciones de proyectos
- mejoras de diseño
- optimización
- mayor seguridad

## Despliegue

El proyecto puede desplegarse gratis en Vercel conectándolo con GitHub y configurando las variables de entorno del proyecto.