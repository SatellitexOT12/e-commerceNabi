# Surface Brief: Home

## Direction Contract

**THESIS:** El Cuaderno de la Casa — la tienda es el cuaderno de recetas de una familia cubana: papel rayado, fichas mecanografiadas, fotos pegadas con esquineros, precios en tickets desprendibles, entradas fechadas. Rehúsa el default de la categoría: hero con gradiente + rejilla de tarjetas redondeadas idénticas con sombra suave, y cualquier cosa que huela a plantilla de e-commerce.

**OWN-WORLD:** Suelo de papel crema #fef7f0 con rayado horizontal; un campo rosa pastel #f8bbd9 inunda una franja entera por sección (nunca acentos esparcidos); tinta chocolate #5d4037 para todo el texto; papel viejo #e9d8c6 para reglas, bordes y tickets. Tipografía con oficio: Bodoni Moda en display (voz de imprenta), Schibsted Grotesk en cuerpo e interfaz, Courier Prime solo en datos (precios, fechas, números de ficha), Caveat como marginalia escasa. Materiales: regla de papel, cinta adhesiva, esquineros de foto, sello de caucho, ticket perforado, casillas de formulario impreso. Controles rectos de radio pequeño, bordes finos de 1px, tabular figures en todo dato numérico.

**STORY:** El visitante abre un cuaderno familiar, no una tienda. En el primer viewport entiende: crepes y mini donas hechos a mano en La Habana, con precio visible en su ticket. Recorre índice → fichas de producto (agregos como lista de ingredientes) → hoja de pedido → entradas del blog fechadas y numeradas. Cada ficha lleva su ticket de precio siempre impreso y pegado; nada flota sin origen.

**FIRST VIEWPORT:** Portada de cuaderno a pantalla completa: fondo de papel rayado, nameplate «Mini Nabi» en Bodoni Moda a gran escala (display máximo 6rem), foto real del crepe pegada con esquineros y una tira de cinta, una línea de datos en Courier Prime (La Habana · crepes y mini donas · entrada nº), y la acción primaria «Ver la tienda» como ticket perforado con borde de puntos. Franja inferior inundada de rosa pastel con el índice de capítulos (Crepes, Mini Donas, Combos) entrando en el segundo viewport. Sin kicker ni eyebrow sobre el encabezado: el nameplate carga solo.

**FORM:** Rediseño completo del sitio con reestructura libre (Home, Shop, Blog, Checkout, Admin + Header/Cart/Producto/PostCard), ruta code-led, sin comp. Seed key: c2b6426e.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Scope

- **Surface:** todo el sitio (Home como superficie primaria)
- **Modes:** Persuade (Home, Shop) · Read (Blog) · Operate (Checkout, Admin)
- **Audience:** Personas en Cuba que piden por WhatsApp y recogen en Miramar / El Cerro
- **Job:** Explorar catálogo, personalizar con agregos, pedir; leer el blog; administrar
- **Constraints fijos:** paleta cálida rosa pastel / crema / chocolate innegociable; fotos reales existentes de Supabase; sin emojis; sin look de plantilla; sin oscurecer; sin saturar
- **Build path:** code (sin generación de imagen disponible en esta sesión)

## Open Decisions

- Cuánta marginalia manuscrita por página (máximo: notas al margen realmente informativas)
- Si el Admin recibe el mismo papel rayado completo o una versión más sobria del mismo mundo
