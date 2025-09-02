-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric NOT NULL,
  expense_date date DEFAULT CURRENT_DATE,
  type text NOT NULL DEFAULT 'general'::text,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY['lunettes'::text, 'bagues'::text, 'colliers'::text, 'sets'::text, 'bracelets'::text])),
  reference text NOT NULL UNIQUE,
  purchase_price numeric NOT NULL DEFAULT 0,
  selling_price numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid,
  quantity_sold integer NOT NULL DEFAULT 1,
  sale_price numeric NOT NULL,
  sale_date timestamp with time zone DEFAULT now(),
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sales_pkey PRIMARY KEY (id),
  CONSTRAINT sales_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT sales_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'manager'::text CHECK (role = ANY (ARRAY['owner'::text, 'manager'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);