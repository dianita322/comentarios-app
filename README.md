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
- tema oscuro por defecto
- sección pública de publicaciones
- detalle por slug para cada publicación
- panel para crear publicaciones desde la propia web
- subida de imágenes de portada a Supabase Storage
- panel para ver borradores y publicaciones del autor
- edición de publicaciones existentes desde el panel de autor
- eliminación de publicaciones
- limpieza básica de portadas antiguas al editar o eliminar
- formato visual tipo Markdown sencillo para el contenido
- vista previa en vivo dentro del editor
- categorías para publicaciones
- filtrado básico por categoría en la vista pública
- sección real de proyectos
- categorías y filtros para proyectos
- panel de proyectos solo para admin
- edición y eliminación de proyectos
- subida de portadas de proyectos desde la web
- limpieza básica de portadas de proyectos al editar o eliminar

## Rutas principales

- `/` → inicio
- `/feed` → feed de comentarios
- `/posts` → listado público de publicaciones
- `/posts/new` → crear publicación
- `/posts/manage` → ver mis publicaciones
- `/posts/manage/[id]/edit` → editar publicación
- `/posts/[slug]` → detalle de publicación
- `/projects` → listado público de proyectos
- `/projects/new` → crear proyecto
- `/projects/manage` → ver mis proyectos
- `/projects/manage/[id]/edit` → editar proyecto
- `/projects/[slug]` → detalle de proyecto
- `/account` → cuenta del usuario

## Nota

En esta fase las portadas de proyectos ya pueden subirse desde la web. El siguiente día puede ser un panel admin más completo o la integración avanzada de herramientas.