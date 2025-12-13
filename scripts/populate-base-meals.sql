-- Populate Base Meals Package with Production Meals
-- All 21 meals from pasti table (all meals were migrated, test meals were excluded)

INSERT INTO package_items (packageId, mealId, createdAt, updatedAt)
SELECT 
    2 as packageId,  -- Base Meals package ID
    codice_pasto as mealId,
    NOW() as createdAt,
    NOW() as updatedAt
FROM pasti
ON DUPLICATE KEY UPDATE updatedAt = NOW();

-- Verify count
SELECT 
    'Base Meals' as package_name,
    COUNT(*) as meal_count
FROM package_items
WHERE packageId = 2;
