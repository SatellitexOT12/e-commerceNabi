# 🍰 MiniNabi - Tienda de Dulces

Tienda virtual de crepes y mini donas artesanales, desarrollada con React, TypeScript, Vite y Supabase.

🔗 **URL**: https://satellitexot12.github.io/e-commerceNabi/#/

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Despliegue](#despliegue)
- [Panel Administrativo](#panel-administrativo)
- [Funcionalidades por Página](#funcionalidades-por-página)
- [API y Servicios](#api-y-servicios)
- [Base de Datos](#base-de-datos)
- [Scripts Útiles](#scripts-útiles)
- [Solución de Problemas](#solución-de-problemas)

---

## ✨ Características

### Para Clientes
- 🛒 Catálogo de productos con filtros por categoría y búsqueda
- 🛍️ Carrito de compras persistente (localStorage)
- 📱 Diseño 100% responsive
- 🚚 Formulario de checkout con envío por WhatsApp
- 📞 Contacto directo a dos números de WhatsApp
- ⭐ Historia de la marca y sección de contacto

### Para Administradores
- 🔐 Panel de administración con autenticación
- 📦 Gestión completa de productos (CRUD)
- 🍫 Gestión de agregos (cremes, chocolates, frutas, etc.)
- 📊 Dashboard financiero con gráficos y proyecciones
- 📋 Seguimiento de pedidos en tiempo real
- 💰 Registro de ventas manuales
- 📈 Estadísticas de ventas diarias

---

## 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| **React** | 18.2.0 | Framework UI |
| **TypeScript** | 5.3.3 | Tipado estático |
| **Vite** | 5.1.0 | Build tool |
| **React Router DOM** | 6.20.1 | Navegación |
| **Supabase** | 2.38.4 | Backend (DB + Auth) |
| **React Hook Form** | 7.48.0 | Formularios |
| **React Hot Toast** | 2.4.1 | Notificaciones |
| **Recharts** | 3.8.1 | Gráficos |
| **Lucide React** | 0.294.0 | Iconos |

---

## 📁 Estructura del Proyecto

```
e-commerceNabi/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── CartModal.tsx    # Modal del carrito
│   │   ├── Header.tsx       # Navegación superior
│   │   └── ProductCard.tsx  # Tarjeta de producto
│   ├── contexts/            # Contextos de React
│   │   └── CartContext.tsx  # Estado global del carrito
│   ├── pages/               # Páginas principales
│   │   ├── Admin.tsx        # Panel de administración
│   │   ├── Checkout.tsx     # Formulario de pedido
│   │   ├── Home.tsx         # Página principal
│   │   └── Shop.tsx         # Tienda/catálogo
│   ├── services/            # Servicios y API
│   │   ├── auth.ts          # Autenticación Supabase
│   │   ├── orders.ts        # Gestión de pedidos
│   │   └── products.ts      # Gestión de productos
│   ├── utils/               # Utilidades
│   │   └── whatsapp.ts      # Formato de mensajes WhatsApp
│   ├── App.tsx              # Componente raíz
│   ├── App.css              # Estilos globales
│   └── main.tsx             # Punto de entrada
├── public/                  # Archivos estáticos
├── index.html               # Plantilla HTML
├── vite.config.ts           # Configuración Vite
└── package.json             # Dependencias
```

---

## 🚀 Instalación

### Requisitos
- **Node.js** >= 18.x
- **npm** o **yarn**
- Cuenta en [Supabase](https://supabase.com)

### Pasos

1. **Clonar repositorio**
```bash
git clone https://github.com/SatellitexOT12/e-commerceNabi.git
cd e-commerceNabi
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
VITE_WHATSAPP_NUMBER_1=+535845670
VITE_WHATSAPP_NUMBER_2=+533495645
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```
La app estará en `http://localhost:5173`

---

## ⚙️ Configuración

### Base de Datos Supabase

Ejecuta este SQL en el editor de SQL de Supabase:

```sql
-- Tabla de productos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  precio NUMERIC NOT NULL,
  categoria TEXT NOT NULL,
  imagen_url TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de agregos (toppings)
CREATE TABLE agregos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  precio NUMERIC NOT NULL,
  categoria TEXT NOT NULL,
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de pedidos
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

-- Tabla de configuración
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  whatsapp_numero1 TEXT NOT NULL,
  whatsapp_numero2 TEXT NOT NULL
);

-- Insertar datos iniciales
INSERT INTO settings (whatsapp_numero1, whatsapp_numero2)
VALUES ('+535845670', '+533495645');
```

### Autenticación Supabase

1. En Supabase Dashboard → Authentication → Providers
2. Activar **Email** (con confirmación desactivada para desarrollo)
3. Crear usuario administrador desde Authentication → Users

---

### GitHub Actions (Despliegue Automático)

El proyecto incluye un workflow de GitHub Actions que se activa automáticamente cada vez que haces `git push` a la rama `main`.

**Flujo automático:**
1. ✅ Clona el código
2. ✅ Instala dependencias (`npm ci`)
3. ✅ Construye la app (`npm run build`)
4. ✅ Despliega a GitHub Pages

#### Configuración de Secrets

Ve a **Settings → Secrets and variables → Actions** en tu repositorio y agrega:

| Nombre del Secret | Valor | Requerido |
|---|---|---|
| `SUPABASE_URL` | URL de tu proyecto Supabase | Sí |
| `SUPABASE_ANON_KEY` | Clave anónima de Supabase | Sí |
| `WHATSAPP_NUMBER_1` | Primer número WhatsApp (ej: +535845670) | No |
| `WHATSAPP_NUMBER_2` | Segundo número WhatsApp (ej: +533495645) | No |

**¿Dónde encontrar las credenciales de Supabase?**
1. Ve a tu proyecto en Supabase
2. Settings → API
3. Copia `URL` y `anon public` key

**Nota**: Los números de WhatsApp son opcionales. Si no se configuran, se usan los valores por defecto del código.

#### Despliegue Manual (workflow_dispatch)

También puedes disparar el despliegue manualmente:
1. Ve a **Actions** en tu repo
2. Selecciona workflow "Deploy to GitHub Pages"
3. Click **Run workflow** → **Run workflow**

---

## 🚀 Despliegue

### GitHub Actions (Automático)

Cada `git push` a `main` despliega automáticamente a GitHub Pages.

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
# ↓ Automáticamente se desplegará en ~2-3 minutos
```

**URL**: https://satellitexot12.github.io/e-commerceNabi/

### Manual (Alternativo)

Si prefieres desplegar manualmente:
1. Ve a Settings → Pages en tu repo
2. Source: `Deploy from a branch`
3. Branch: `gh-pages` / `/(root)`
4. Save

### Producción

Para build local sin deploy:
```bash
npm run build
```
Los archivos están en la carpeta `dist/`

---

## 🔐 Panel Administrativo

### Acceso
- URL: `/admin`
- Usa las credenciales de Supabase Auth

### Funcionalidades

#### 📦 Productos
- **Ver lista** de todos los productos
- **Agregar** nuevo producto (con subida de imagen o URL)
- **Editar** producto existente
- **Eliminar** producto (con confirmación)
- **Toggle** disponible/no disponible

#### 🍫 Agregos (Toppings)
- Gestión de cremes, chocolates, frutas
- Precios adicionales por unidad
- Control de disponibilidad

#### 📊 Finanzas
- **Gráfico** de ventas diarias
- **Tabla** detallada por fecha
- **Cálculos automáticos**:
  - Total vendido
  - Reinversión (50%)
  - Fondo (50%)
  - Ganancia bruta
  - Ahorro (30% de ganancia bruta)
  - Ganancia personal (70% de ganancia bruta)
- **Venta manual**: Registro de ventas sin pedido online

#### 📋 Pedidos
- Lista de todos los pedidos recibidos
- **Marcar como completado**
- Ver detalles de productos
- Fecha y estado

---

## 🎯 Funcionalidades por Página

### 🏠 Home (`/`)
- Hero section con llamado a la acción
- Carrusel de productos destacados
- Sección "Historia" de crepes y mini donas
- Información de contacto completa
- Puntos de recogida (Miramar, El Cerro)
- Métodos de pago aceptados
- Características del servicio

### 🛍️ Shop (`/shop`)
- Grid responsivo de productos
- **Búsqueda** por nombre/descripción
- **Filtros** por categoría:
  - Crepes
  - Mini Donas
  - Combos de Crepes
  - Combos de Donas
  - Combos Mixtos
- Productos solo disponibles (stock > 0)
- Modal de agregos por producto
- Botón "Agregar al carrito" con notificación

### 🛒 Checkout (`/checkout`)
- Resumen del pedido con productos y total
- Formulario con validación:
  - Nombre completo
  - Dirección de entrega
  - Teléfono (+53 prefijo Cuba)
- **Envío automático** a ambos números de WhatsApp
- **Guardado** en base de datos (Supabase)
- Limpieza automática del carrito post-pedido

### 🛒 Carrito (Modal)
- Icono en header con contador
- Lista de productos + agregos
- Ajuste de cantidades
- Cálculo de total en tiempo real
- Botón "Ver carrito" → Checkout

---

## 🔌 API y Servicios

### `src/services/products.ts`
- `getProducts()` → Product[]
- `createProduct(data)` → Product
- `updateProduct(id, data)` → Product
- `deleteProduct(id)` → void
- `uploadProductImage(file)` → URL (storage)

### `src/services/orders.ts`
- `getOrders()` → Order[]
- `saveOrder(order)` → Order
- `updateOrderStatus(id, status)` → void

### `src/services/agregos.ts`
- `getAgregos()` → Agregado[]
- `createAgregado(data)` → Agregado
- `updateAgregado(id, data)` → Agregado
- `deleteAgregado(id)` → void

### `src/services/auth.ts`
- `signIn(email, password)` → User
- `signOut()` → void
- `getCurrentUser()` → User | null

### `src/utils/whatsapp.ts`
- `generateOrderMessage(order)` → string (formato Markdown)
- `sendToBothNumbers(message)` → Promise<void>

### `src/contexts/CartContext.tsx`
Contexto global para el carrito:
- `state`: { items[], total }
- `addItem(product, agregos?)`
- `removeItem(productId)`
- `updateQuantity(productId, qty)`
- `clearCart()`

---

## 🗄️ Base de Datos

### Tabla `products`
```sql
id (UUID, PK)
nombre (TEXT)
descripcion (TEXT)
precio (NUMERIC)
categoria (TEXT)
imagen_url (TEXT)
stock (INTEGER)
disponible (BOOLEAN)
created_at (TIMESTAMP)
```

### Tabla `agregos`
```sql
id (UUID, PK)
nombre (TEXT)
precio (NUMERIC)
categoria (TEXT) -- 'Cremes', 'Chocolates', 'Frutas', 'Otros'
disponible (BOOLEAN)
created_at (TIMESTAMP)
```

### Tabla `orders`
```sql
id (UUID, PK)
cliente_nombre (TEXT)
cliente_direccion (TEXT)
cliente_telefono (TEXT)
productos (JSONB) -- [{product, quantity, agregos[]}]
total (NUMERIC)
fecha (TIMESTAMP)
estado (TEXT) -- 'pendiente' | 'completado'
```

### Tabla `settings`
```sql
id (INTEGER, PK)
whatsapp_numero1 (TEXT)
whatsapp_numero2 (TEXT)
```

---

## ⌨️ Scripts Útiles

```bash
# Desarrollo (hot reload)
npm run dev

# Build de producción
npm run build

# Preview local del build
npm run preview

# Deploy a GitHub Pages
npm run deploy

# Linter (si configurado)
npm run lint

# Type check
npm run typecheck
```

---

## 🐛 Solución de Problemas

### Problema: "Imágenes no cargan en GitHub Pages"
**Solución**: Verificar que `base` en `vite.config.ts` sea `/e-commerceNabi/`

### Problema: "Pedidos no llegan a WhatsApp"
**Solución**: 
1. Verificar números en `settings` de Supabase
2. Formato debe incluir prefijo country code (+53 para Cuba)
3. WhatsApp Business API require número verificado

### Problema: "No puedo loguearme como admin"
**Solución**:
1. Verificar que el usuario existe en Supabase Auth
2. Email confirmation debe estar desactivada en desarrollo
3. Check `auth.users` en Supabase SQL

### Problema: "Build falla en producción"
**Solución**:
1. Verificar variables de entorno en GitHub Pages Settings → Secrets
2. Agregar `VITE_` prefix a todas las variables
3. Revisar que no haya dependencias opcionales

---

## 📞 Contacto

- **Teléfonos**: +53 5 5845670 | +53 5 3495645
- **Instagram**: [@mini.donitasycrepesnabi](https://instagram.com/mini.donitasycrepesnabi)
- **Puntos de recogida**: Miramar, El Cerro (sin costo)
- **Mensajería**: Disponible con costo adicional

---

## 📄 Licencia

Proyecto privado - Todos los derechos reservados © 2024 MiniNabi.
