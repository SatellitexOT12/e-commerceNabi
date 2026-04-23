# 🍰 MiniNabi - Tienda de Dulces

Tienda virtual de crepes y mini donas artesanales, desarrollada con React, TypeScript, Vite y Supabase.

🔗 **URL**: https://satellitexot12.github.io/e-commerceNabi/#/

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Despliegue](#despliegue)
- [Panel Administrativo](#panel-administrativo)
- [Funcionalidades por Página](#funcionalidades-por-página)
- [Scripts Útiles](#scripts-útiles)
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
