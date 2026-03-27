# Comentarios App

Aplicación web construida con Next.js + Supabase.

## Estado actual

La app ya incluye:

- autenticación con correo y contraseña
- recuperación y cambio de contraseña
- feed de comentarios
- respuestas
- reacciones
- imágenes
- perfil de usuario
- rutas base para futuras secciones de publicaciones y proyectos

## Estructura actual

- `app/` → rutas principales de la aplicación
- `components/` → componentes reutilizables
- `lib/` → utilidades, configuración y helpers
- `sql/` → scripts SQL del proyecto

## Rutas principales

- `/` → inicio
- `/feed` → feed de comentarios
- `/posts` → base de publicaciones
- `/projects` → base de proyectos
- `/account` → cuenta del usuario
- `/auth/login` → iniciar sesión
- `/auth/sign-up` → crear cuenta
- `/auth/forgot-password` → recuperar contraseña
- `/auth/update-password` → cambiar contraseña

## Objetivo del proyecto

Esta base se está convirtiendo por fases en una plataforma más completa para:

- publicar contenido tipo blog
- mostrar proyectos personales
- compartir imágenes y videos
- mejorar diseño y organización
- mantener una base gratuita, segura y escalable

## Ejecutar en local

```bash
npm install
npm run dev
```

Luego abre:

```bash
http://localhost:3000
```