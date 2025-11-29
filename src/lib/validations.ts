import { z } from 'zod';

export const commentSchema = z.object({
  comment: z.string()
    .trim()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be less than 500 characters')
});

export const videoUploadSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .trim()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  category: z.enum(['resep', 'hidden_gem', 'tips']),
  tags: z.array(z.string().trim().max(30))
    .max(10, 'Maximum 10 tags allowed'),
  location: z.string()
    .trim()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  budget: z.string().trim().max(50).optional(),
  cooking_time: z.string().trim().max(50).optional()
});

export const profileUpdateSchema = z.object({
  username: z.string()
    .trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  display_name: z.string()
    .trim()
    .min(1, 'Full name is required')
    .max(35, 'Full name must be less than 35 characters'),
  bio: z.string()
    .trim()
    .max(200, 'Bio must be less than 200 characters')
    .optional()
});
