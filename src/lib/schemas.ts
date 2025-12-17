import { z } from 'zod';

export const IngredientSchema = z.object({
    id: z.string().optional(), // For editing existing ingredients if needed
    foodName: z.string().min(1, "Food name is required"),
    grams: z.preprocess(
        (val) => Number(val),
        z.number().positive("Grams must be positive")
    ),
    // Optional macros for custom/missing foods passed from frontend
    protein: z.preprocess((val) => Number(val || 0), z.number().optional()),
    carbs: z.preprocess((val) => Number(val || 0), z.number().optional()),
    fat: z.preprocess((val) => Number(val || 0), z.number().optional()),
});

export const MealSchema = z.object({
    id: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    mealType: z.preprocess(
        (val) => Number(val),
        z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])
    ),
    blocks: z.preprocess(
        (val) => Number(val),
        z.number().min(0, "Blocks cannot be negative")
    ),
    isShared: z.boolean().optional().default(false),
    foods: z.array(IngredientSchema).min(1, "At least one ingredient is required"),
});

export type MealInput = z.infer<typeof MealSchema>;

export const ChefSchema = z.object({
    mode: z.enum(['fridge', 'zone']).optional().default('fridge'),
    ingredients: z.array(z.string()).optional(),
    manualIngredients: z.array(z.string()).optional(),
    blocks: z.preprocess((val) => Number(val || 3), z.number().min(1).max(30)),
    mealTime: z.string().optional(),
    preference: z.string().optional()
});

export type ChefInput = z.infer<typeof ChefSchema>;

export const UserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 chars").max(50),
    password: z.string().optional(), // Optional, if empty will be auto-generated
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    targetRole: z.preprocess(
        (val) => Number(val),
        z.union([z.literal(1), z.literal(2), z.literal(3)])
    ).optional().default(3), // Default to Patient
    assignBasePackages: z.boolean().optional().default(true)
});

export const UserUpdateSchema = z.object({
    id: z.preprocess((val) => Number(val), z.number()),
    username: z.string().min(3).max(50).optional(),
    email: z.string().email().optional().or(z.literal('')),
    role: z.preprocess(
        (val) => Number(val),
        z.union([z.literal(1), z.literal(2), z.literal(3)])
    ).optional(),
    password: z.string().optional() // Only if updating
});

export type UserInput = z.infer<typeof UserSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
