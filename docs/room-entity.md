# Entidad Room

Documentación de la entidad **Room** del módulo de salas anónimas (milestone `v0.4.0`).

> Relacionado: issue [#18](https://github.com/hidetsumi/mikan-api/issues/18) (Room entity + migration), [#19](https://github.com/hidetsumi/mikan-api/issues/19) (POST /rooms), [#20](https://github.com/hidetsumi/mikan-api/issues/20) (GET /rooms/:slug).

## Propósito

Una `Room` es un contenedor de todos compartido. Los usuarios autenticados pueden crearla; el acceso de invitados (anónimos) se resuelve por su **`slug`** público.

## Campos

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `String` (uuid) | PK, autogenerado |
| `slug` | `String` | **Único, autogenerado.** Identificador público para unirse a la sala sin auth |
| `name` | `String` | Nombre visible de la sala |
| `description` | `String?` | Opcional |
| `owner_user_id` | `String` | FK al usuario dueño |
| `visibility` | `RoomVisibility` | `public` \| `private` |
| `access_mode` | `RoomAccessMode` | `view_only` \| `comment_only` \| `edit` |
| `status` | `RoomStatus` | `open` \| `closed` |
| `expiry_date` | `DateTime?` | Fecha de expiración (cron de limpieza en #22) |
| `created_at` | `DateTime` | `@default(now())` |
| `updated_at` | `DateTime` | `@updatedAt` |

## Requerimiento de `slug` único

El `slug` es el contrato central de las salas anónimas y **debe** cumplir:

1. **Único** a nivel base de datos — índice `@unique` en Prisma + `CREATE UNIQUE INDEX` en la migración.
2. **Autogenerado** al crear la sala (no lo provee el cliente).
3. **URL-safe** — usado directamente en `GET /rooms/:slug`.

> ⚠️ Estado actual: la implementación en la rama `feature/MKN-18-room-entity` **no incluye** el campo `slug` ni su índice único. El endpoint `GET /rooms/:slug` (#20) depende de esto.

## Endpoints relacionados

- `POST /rooms` (#19) — crea la sala (requiere auth), devuelve el `slug`.
- `GET /rooms/:slug` (#20) — acceso público/anónimo por slug.
