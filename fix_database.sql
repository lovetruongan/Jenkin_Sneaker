-- Fix database script for category null issue

-- 1. Check products with null category
SELECT id, name, category_id FROM products WHERE category_id IS NULL;

-- 2. Create a default category if not exists
INSERT INTO categories (name, created_at, updated_at) 
SELECT 'Chưa phân loại', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Chưa phân loại');

-- 3. Get the default category ID
SET @default_category_id = (SELECT id FROM categories WHERE name = 'Chưa phân loại' LIMIT 1);

-- 4. Update products with null category to use default category
UPDATE products 
SET category_id = @default_category_id, updated_at = NOW()
WHERE category_id IS NULL;

-- 5. Verify the fix
SELECT 
    p.id, 
    p.name, 
    p.category_id, 
    c.name as category_name 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.id 
WHERE p.category_id = @default_category_id;

-- 6. Check if any products still have null category
SELECT COUNT(*) as products_with_null_category FROM products WHERE category_id IS NULL; 