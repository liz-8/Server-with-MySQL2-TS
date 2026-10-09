# API de productos

API REST con Node.js, Express, TypeScript y MySQL2.

## Uso

1. `npm install`
2. Copia `.env.example` a `.env` y pon tus datos de MySQL.
3. Ejecuta `db/products.sql` en MySQL.
4. `npm run dev` (desarrollo), `npm run build` y `npm start` (compilado).

## Rutas (`/api/v1/products`)

| Método | Ruta | Operación |
| --- | --- | --- |
| GET | /getAll?active=TRUE | Obtener todos los activos |
| GET | /getById/:id | Obtener por ID |
| POST | /create | Crear |
| PUT | /update/:id | Actualizar |
| DELETE | /delete/:id | Baja lógica |
| PATCH | /change-price/:id | Cambiar precio |

Las solicitudes de ejemplo están en `requests.http`.
