# Configuración del Blog - Supabase

Para que el sistema de blog funcione correctamente, necesitas crear las siguientes tablas en Supabase:

## Tabla 1: blog_posts

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description VARCHAR(500) NOT NULL,
  image_url TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at DESC);
```

## Tabla 2: blog_likes

```sql
CREATE TABLE blog_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

-- Crear índices
CREATE INDEX idx_blog_likes_post_id ON blog_likes(post_id);
CREATE INDEX idx_blog_likes_user_id ON blog_likes(user_id);
```

## Política de Row Level Security (RLS)

Para la tabla `blog_posts`:

```sql
-- Permitir leer todos los posts
CREATE POLICY "Allow read all posts" 
  ON blog_posts 
  FOR SELECT 
  USING (true);

-- Permitir crear posts solo si estás logueado
CREATE POLICY "Allow users to create posts" 
  ON blog_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Permitir actualizar solo tus propios posts
CREATE POLICY "Allow users to update their posts" 
  ON blog_posts 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permitir eliminar solo tus propios posts
CREATE POLICY "Allow users to delete their posts" 
  ON blog_posts 
  FOR DELETE 
  USING (auth.uid() = user_id);
```

Para la tabla `blog_likes`:

```sql
-- Permitir leer todos los likes
CREATE POLICY "Allow read all likes" 
  ON blog_likes 
  FOR SELECT 
  USING (true);

-- Permitir crear likes solo si estás logueado
CREATE POLICY "Allow users to create likes" 
  ON blog_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Permitir eliminar solo tus propios likes
CREATE POLICY "Allow users to delete their likes" 
  ON blog_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);
```

## Almacenamiento en Supabase Storage

Asegúrate de que el bucket `pics` tiene la siguiente configuración:
- **Nombre**: pics
- **Privacidad**: Público
- **Permitir lectura**: Sí
- **Permitir escritura**: Solo autenticados

## Notas

1. El sistema permite publicar posts a cualquier usuario logueado (no solo administrador)
2. Cada usuario puede editar y eliminar solo sus propios posts
3. Los likes se cuentan automáticamente en el contador de cada post
4. Las imágenes se guardan en la carpeta `blog/` dentro del bucket `pics`

Para cambiar esto y permitir que solo ciertos usuarios publiquen, puedes:
1. Agregar un campo `is_admin` a la tabla `auth.users`
2. Modificar las políticas de RLS para verificar ese campo
