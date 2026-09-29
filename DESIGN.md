---
name: MiniNabi
description: Tienda artesanal de crepes y mini donas — cálida, dulce y hecha a mano
colors:
  rosa-pastel: "#f8bbd9"
  crema: "#fef7f0"
  chocolate: "#5d4037"
  rojo-alerta: "#e74c3c"
  blanco: "#ffffff"
  gris-suave: "#999999"
  gris-texto: "#666666"
  gris-borde: "#eeeeee"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "4.5rem"
    fontWeight: 600
    lineHeight: 1.15
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.8rem"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "DM Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "DM Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  xs: "5px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "20px"
  xxl: "24px"
  pill: "30px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  xxl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.chocolate}"
    textColor: "{colors.blanco}"
    rounded: "{rounded.lg}"
    padding: "1.2rem 3.5rem"
  button-primary-hover:
    backgroundColor: "#4a3229"
    textColor: "{colors.blanco}"
  button-secondary:
    backgroundColor: "{colors.rosa-pastel}"
    textColor: "{colors.chocolate}"
    rounded: "{rounded.lg}"
    padding: "0.6rem 1.2rem"
  button-secondary-hover:
    backgroundColor: "{colors.chocolate}"
    textColor: "{colors.blanco}"
  card:
    backgroundColor: "{colors.blanco}"
    rounded: "{rounded.lg}"
    padding: "1rem"
  input:
    backgroundColor: "{colors.blanco}"
    textColor: "{colors.chocolate}"
    rounded: "{rounded.sm}"
    padding: "0.875rem"
  tag:
    backgroundColor: "{colors.chocolate}"
    textColor: "{colors.blanco}"
    rounded: "{rounded.pill}"
    padding: "0.3rem 1rem"
---

# Design System: MiniNabi

## Overview

**Creative North Star: "La Pastelería de la Esquina"**

El sistema visual de MiniNabi evoca la tienda de dulces del barrio: ese lugar conocido, cálido y confiable donde cada producto se siente hecho a mano con cuidado. El diseño combina la ternura del rosa pastel con la profundidad del chocolate, creando un ambiente que es simultáneamente inocente y con carácter. No hay aristas duras ni contrastes agresivos; todo invita a quedarse, explorar y elegir.

La estética es deliberadamente suave: gradientes sutiles de rosa a crema, sombras ligeras que sugieren papel grueso en lugar de vidrio flotante, y tipografía redondeada que refuerza la sensación artesanal. Cada elemento visual comunica "hecho con amor" sin caer en lo empalagoso.

**Key Characteristics:**
- Paleta cálida y dulce: rosa pastel, crema y chocolate como trinidad cromática
- Formas redondeadas y orgánicas en todos los componentes
- Sombras suaves y sutiles que dan profundidad sin peso
- Tipografía Poppins: geométrica, amigable, con personalidad
- Gradientes sutiles de rosa a crema como recurso característico
- Espaciado generoso que permite que el contenido respire

## Colors

La paleta se construye sobre tres colores principales que trabajan juntos para crear la atmósfera cálida y artesanal de la marca.

### Primary
- **Rosa Pastel** (#f8bbd9): Color de marca, usado en gradientes, bordes de inputs, botones secundarios y elementos decorativos. Es el color que define la identidad MiniNabi.

### Secondary
- **Crema** (#fef7f0): Color de fondo principal, usado en el body, secciones y como base para tarjetas blancas. Proporciona calidez sin ser amarillento.

### Neutral
- **Chocolate** (#5d4037): Color de texto principal, botones primarios y elementos de énfasis. Aporta la profundidad y seriedad que equilibra la dulzura del rosa.
- **Blanco** (#ffffff): Fondo de tarjetas, modales y superficies elevadas.
- **Gris Suave** (#999999): Texto secundario, categorías, placeholders.
- **Gris Texto** (#666666): Descripciones y texto de apoyo.
- **Gris Borde** (#eeeeee): Bordes sutiles, separadores, líneas divisorias.

### Alert
- **Rojo Alerta** (#e74c3c): Errores de formulario, botón de eliminar, contador del carrito.

### Named Rules
**The Gradient Rule.** Los gradientes siempre van de rosa pastel a crema, en dirección 135deg. Este es el recurso visual característico de la marca y debe usarse consistentemente en headers, hero sections y elementos destacados.

## Typography

**Display Font:** Poppins (300–700, con fallback a sans-serif)
**Body Font:** Poppins (400–500)

**Character:** Poppins es una tipografía geométrica con terminales redondeados que refuerza la sensación amigable y artesanal. Su versatilidad permite usarla desde títulos grandes hasta texto pequeño sin perder personalidad.

### Hierarchy
- **Display** (700, 3.5rem, line-height 1.1): Títulos hero, nombres de marca. Solo en secciones principales.
- **Headline** (700, 2.5rem, line-height 1.2): Títulos de sección, encabezados de página.
- **Title** (600, 1.8rem, line-height 1.3): Subtítulos, nombres de producto destacados.
- **Body** (400, 1rem, line-height 1.6): Texto general, descripciones, párrafos. Longitud máxima recomendada: 65–75 caracteres.
- **Label** (500, 0.85rem, line-height 1.4): Categorías, etiquetas, texto de botones pequeños.

### Named Rules
**The One Voice Rule.** Toda la tipografía es Poppins. No se introducen fuentes decorativas ni display alternativas. La jerarquía se logra con peso y tamaño, no con familias diferentes.

## Layout

El sistema de layout se basa en un contenedor principal de **1200px** de ancho máximo, centrado con `margin: 0 auto`. El carrusel de productos destacados usa un contenedor más amplio de **1400px** para aprovechar el espacio disponible.

**Grid y columnas:**
- Shop: sidebar de filtros (250px) + contenido flexible
- Checkout: formulario (1fr) + resumen de pedido (380px)
- Features: grid auto-fit con mínimo de 250px por tarjeta
- Contact: grid auto-fit con mínimo de 280px por tarjeta

**Espaciado:**
- Secciones principales: `4rem` vertical
- Entre bloques: `2rem`
- Padding de contenedores: `1rem` a `2rem`
- Gap entre elementos: `0.5rem` a `1.5rem`

**Responsive:**
- **≤1024px:** Carrusel reduce a 3 items, grids se ajustan
- **≤768px:** Sidebar se oculta (modal), hero reduce tamaño, grids a 1 columna
- **≤480px:** Tipografía se reduce, padding se ajusta, botones de carrusel se ocultan (swipe)

## Elevation & Depth

El sistema es **plano con capas tonales**. No se usan sombras dramáticas ni efectos de vidrio flotante. La profundidad se logra mediante:

1. **Contraste tonal:** Superficies blancas sobre fondo crema
2. **Sombras sutiles:** `0 2px 10px rgba(0,0,0,0.1)` a `0 4px 15px rgba(0,0,0,0.1)` para dar ligereza
3. **Bordes sutiles:** `1px solid #eee` para separar elementos sin peso visual

### Shadow Vocabulary
- **Subtle** (`0 2px 10px rgba(0,0,0,0.1)`): Header, filtros, elementos en reposo
- **Standard** (`0 4px 15px rgba(0,0,0,0.1)`): Tarjetas, formularios, contenedores
- **Elevated** (`0 8px 25px rgba(93,64,55,0.2)`): Hover de tarjetas, elementos interactivos
- **Floating** (`0 10px 20px rgba(0,0,0,0.05)`): Items de carrusel, elementos destacados

### Named Rules
**The Soft Shadow Rule.** Las sombras son siempre suaves y de baja opacidad. Nunca se usan sombras duras o de alto contraste. La elevación máxima es sutil: el diseño debe sentirse como papel grueso, no como vidrio flotante.

## Shapes

El lenguaje de formas es **redondeado y orgánico**:

- **Inputs y botones pequeños:** 8px (esquinas suaves)
- **Tarjetas y contenedores:** 12px (redondeo medio)
- **Tarjetas grandes y modales:** 20px (redondeo generoso)
- **Items de carrusel:** 24px (redondeo máximo)
- **Botones CTA y tags:** 30px (pill, completamente redondeados)

**Bordes:** `1px solid #eee` para separaciones sutiles. `2px solid var(--primary-color)` para inputs en estado normal.

**Recorte:** Las imágenes usan `border-radius` heredado del contenedor. `object-fit: cover` para mantener proporciones.

## Components

### Buttons
- **Shape:** Pill (30px radius) para CTA principales, 8px para botones de formulario
- **Primary:** Chocolate (#5d4037) con texto blanco, padding 1rem 2.5rem
- **Hover:** Se eleva 2-3px con sombra sutil, o cambia a rosa pastel con texto chocolate
- **Secondary:** Rosa pastel con borde chocolate, texto chocolate
- **Disabled:** Opacidad 0.5-0.6, cursor not-allowed

### Cards / Containers
- **Corner Style:** 12px (tarjetas estándar), 20px (tarjetas grandes)
- **Background:** Blanco (#ffffff)
- **Shadow Strategy:** Sombra sutil en reposo, se intensifica en hover
- **Border:** Sin borde, o `1px solid #eee` para separación
- **Internal Padding:** 1rem a 2rem

### Inputs / Fields
- **Style:** Borde 2px rosa pastel, fondo blanco, radius 8px
- **Focus:** Borde cambia a chocolate, glow sutil `0 0 0 3px rgba(248,187,217,0.3)`
- **Error:** Texto de error en rojo (#e74c3c), borde rojo
- **Disabled:** Opacidad reducida

### Navigation
- **Header:** Gradiente rosa→crema, sticky, sombra sutil
- **Nav Links:** Texto chocolate, hover con subrayado blanco
- **Mobile:** Menú hamburguesa, panel desplegable con el mismo gradiente

### Tags / Chips
- **Style:** Fondo chocolate, texto blanco, pill (30px)
- **Uso:** Categorías, etiquetas de sección, badges

### Carrusel
- **Items:** Fondo blanco, radius 24px, sombra sutil
- **Hover:** Se eleva 8px, imagen hace zoom 1.08
- **Botones:** Circulares, blancos, con sombra sutil
- **Dots:** Pequeños (6px), activos se expanden a 16px

## Do's and Don'ts

### Do:
- **Do** usar gradientes de rosa a crema en headers y secciones destacadas
- **Do** mantener esquinas redondeadas en todos los componentes (mínimo 8px)
- **Do** usar Poppins para toda la tipografía
- **Do** aplicar sombras suaves y sutiles (nunca duras)
- **Do** mantener el espaciado generoso entre elementos
- **Do** usar rosa pastel para elementos interactivos y chocolate para acciones primarias
- **Do** incluir animaciones suaves de hover (translateY, scale) en tarjetas y botones

### Don't:
- **Don't** introducir colores fuera de la paleta (rosa, crema, chocolate, blanco, grises)
- **Don't** usar esquinas rectas o radios menores a 8px
- **Don't** aplicar sombras dramáticas o de alto contraste
- **Don't** mezclar familias de tipografía
- **Don't** usar el rojo de alerta fuera de errores y acciones destructivas
- **Don't** saturar el diseño con muchos gradientes en una misma pantalla
- **Don't** usar imágenes con bordes rectos sin radius
