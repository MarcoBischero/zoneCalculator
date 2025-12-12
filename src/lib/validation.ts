import { z } from 'zod';

/**
 * Security: Input validation schemas for AI endpoints
 * Prevents prompt injection and malicious inputs
 */

// Vision API validation
export const visionInputSchema = z.object({
    image: z.string()
        .min(100, 'Image data too short')
        .max(10 * 1024 * 1024, 'Image too large (max 10MB)')
        .refine(
            (val) => val.startsWith('data:image/') || /^[A-Za-z0-9+/=]+$/.test(val),
            'Invalid image format'
        ),
    blocks: z.number()
        .int('Blocks must be an integer')
        .min(1, 'Minimum 1 block')
        .max(10, 'Maximum 10 blocks')
});

// AI Meal Generation validation
export const aiMealGenerationSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name too long')
        .regex(/^[a-zA-Z0-9\s\-'àèéìòùÀÈÉÌÒÙ]+$/, 'Invalid characters in name'),
    type: z.string()
        .min(1, 'Type is required')
        .max(50, 'Type too long'),
    blocks: z.number()
        .int('Blocks must be an integer')
        .min(1, 'Minimum 1 block')
        .max(10, 'Maximum 10 blocks'),
    preference: z.string()
        .max(200, 'Preference too long')
        .optional()
});

// Calendar generation validation
export const calendarActionSchema = z.object({
    action: z.enum(['generate', 'add', 'remove', 'copy_previous', 'clear_week']),
    day: z.number().int().min(0).max(6).optional(),
    type: z.number().int().min(0).max(4).optional(),
    mealId: z.number().int().positive().optional(),
    column: z.number().int().min(0).max(6).optional()
});

// Password change validation
export const passwordChangeSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password too long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

// User settings validation
export const userSettingsSchema = z.object({
    language: z.enum(['it', 'en', 'es', 'fr', 'de']).optional(),
    nome: z.string().max(100).optional(),
    cognome: z.string().max(100).optional()
});
