/*
  # Create Noora Inventory Management Tables

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, product name)
      - `category` (text, product category: lunettes, bagues, colliers, sets, bracelets)
      - `reference` (text, auto-generated reference like brac1, lun2, etc.)
      - `purchase_price` (numeric, cost price from supplier)
      - `selling_price` (numeric, selling price to customers)
      - `quantity` (integer, stock quantity)
      - `image_url` (text, path to product image)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `sales`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `quantity_sold` (integer, quantity sold in this transaction)
      - `sale_price` (numeric, actual sale price)
      - `sale_date` (timestamp)
      - `user_id` (uuid, who made the sale)
      - `created_at` (timestamp)

    - `expenses`
      - `id` (uuid, primary key)
      - `description` (text, expense description)
      - `amount` (numeric, expense amount)
      - `expense_date` (date)
      - `type` (text, type of expense)
      - `user_id` (uuid, who recorded the expense)
      - `created_at` (timestamp)

    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `role` (text, 'owner' or 'manager')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Managers can view sales data but not expenses
    - Only owners can manage expenses and user roles

  3. Functions
    - Auto-generate product references based on category
    - Update product quantities on sales
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('lunettes', 'bagues', 'colliers', 'sets', 'bracelets')),
  reference text UNIQUE NOT NULL,
  purchase_price numeric(10,2) NOT NULL DEFAULT 0,
  selling_price numeric(10,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity_sold integer NOT NULL DEFAULT 1,
  sale_price numeric(10,2) NOT NULL,
  sale_date timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric(10,2) NOT NULL,
  expense_date date DEFAULT CURRENT_DATE,
  type text NOT NULL DEFAULT 'general',
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'manager' CHECK (role IN ('owner', 'manager')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products (all authenticated users can read/write)
CREATE POLICY "Authenticated users can read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for sales (all authenticated users can read/write)
CREATE POLICY "Authenticated users can read sales"
  ON sales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for expenses (only owners can manage expenses)
CREATE POLICY "Owners can read all expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'owner'
    )
  );

CREATE POLICY "Owners can insert expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'owner'
    )
  );

CREATE POLICY "Owners can update expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'owner'
    )
  );

CREATE POLICY "Owners can delete expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'owner'
    )
  );

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Owners can read all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'owner'
    )
  );

-- Function to auto-generate product references
CREATE OR REPLACE FUNCTION generate_product_reference()
RETURNS TRIGGER AS $$
DECLARE
  category_prefix text;
  next_number integer;
  new_reference text;
BEGIN
  -- Define category prefixes
  CASE NEW.category
    WHEN 'lunettes' THEN category_prefix := 'lun';
    WHEN 'bagues' THEN category_prefix := 'bag';
    WHEN 'colliers' THEN category_prefix := 'col';
    WHEN 'sets' THEN category_prefix := 'set';
    WHEN 'bracelets' THEN category_prefix := 'brac';
    ELSE category_prefix := 'prod';
  END CASE;

  -- Get next number for this category
  SELECT COALESCE(MAX(CAST(SUBSTRING(reference FROM LENGTH(category_prefix) + 1) AS integer)), 0) + 1
  INTO next_number
  FROM products
  WHERE category = NEW.category
    AND reference ~ ('^' || category_prefix || '[0-9]+$');

  -- Generate new reference
  new_reference := category_prefix || next_number;
  NEW.reference := new_reference;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating references
DROP TRIGGER IF EXISTS generate_reference_trigger ON products;
CREATE TRIGGER generate_reference_trigger
  BEFORE INSERT ON products
  FOR EACH ROW
  WHEN (NEW.reference IS NULL OR NEW.reference = '')
  EXECUTE FUNCTION generate_product_reference();

-- Function to update product quantity on sale
CREATE OR REPLACE FUNCTION update_product_quantity_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products 
  SET quantity = quantity - NEW.quantity_sold,
      updated_at = now()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating product quantity on sale
DROP TRIGGER IF EXISTS update_quantity_trigger ON sales;
CREATE TRIGGER update_quantity_trigger
  AFTER INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_product_quantity_on_sale();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating updated_at on products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();