# MiniNabi E-commerce

Tienda virtual de dulces con React, Supabase y WhatsApp.

## Instalación

1. Clona el repositorio
2. Instala dependencias: `npm install`
3. Copia `.env.example` a `.env` y configura las variables de Supabase
4. Ejecuta: `npm run dev`

## Configuración de Supabase

1. Crea un proyecto en Supabase
2. Ejecuta el SQL para crear las tablas:

```sql
-- Tabla products
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  precio NUMERIC NOT NULL,
  categoria TEXT NOT NULL,
  imagen_url TEXT NOT NULL,
  stock INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_nombre TEXT NOT NULL,
  cliente_direccion TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  productos JSONB NOT NULL,
  total NUMERIC NOT NULL,
  fecha TIMESTAMP DEFAULT NOW(),
  estado TEXT DEFAULT 'pendiente'
);

-- Tabla settings
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  whatsapp_numero1 TEXT NOT NULL,
  whatsapp_numero2 TEXT NOT NULL
);

INSERT INTO settings (whatsapp_numero1, whatsapp_numero2) VALUES ('1234567890', '0987654321');
```

3. Configura autenticación en Supabase para admin

## Despliegue en GitHub Pages

1. Build: `npm run build`
2. Despliega la carpeta `dist` en GitHub Pages

## Funcionalidades

- Catálogo de productos desde Supabase
- Carrito de compras con localStorage
- Envío de pedidos por WhatsApp a 2 números
- Panel de admin con autenticación
- Diseño responsive con paleta de colores cálida