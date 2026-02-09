import { z } from 'zod';

// ─── Auth ────────────────────────────────────────────────────
export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  role: z.enum(['creator', 'member']),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ─── Community ───────────────────────────────────────────────
export const updateCommunitySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  membership_entitlement_id: z.string().max(200).optional().nullable(),
});
export type UpdateCommunityInput = z.infer<typeof updateCommunitySchema>;

// ─── Post ────────────────────────────────────────────────────
export const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(5000),
  image_url: z.string().url().optional().nullable(),
  program_id: z.string().uuid().optional().nullable(),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

// ─── Comment ─────────────────────────────────────────────────
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(2000),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

// ─── Program ─────────────────────────────────────────────────
export const createProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  start_date: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
  end_date: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
  price_cents: z.number().int().min(0),
  capacity: z.number().int().min(1).optional().nullable(),
  visibility: z.enum(['public', 'private']),
});
export type CreateProgramInput = z.infer<typeof createProgramSchema>;

export const updateProgramSchema = createProgramSchema.partial();
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;

// ─── Weekly Prompt ───────────────────────────────────────────
export const createPromptSchema = z.object({
  content: z.string().min(1).max(2000),
  week_number: z.number().int().min(1),
});
export type CreatePromptInput = z.infer<typeof createPromptSchema>;

// ─── Class ───────────────────────────────────────────────────
export const createClassSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  date_time: z.string().refine((v) => !isNaN(Date.parse(v)), 'Invalid date/time'),
  duration_minutes: z.number().int().min(1).max(480),
  location_type: z.enum(['zoom', 'physical']),
  location_value: z.string().min(1, 'Location is required'),
  program_id: z.string().uuid().optional().nullable(),
});
export type CreateClassInput = z.infer<typeof createClassSchema>;

export const updateClassSchema = createClassSchema.partial();
export type UpdateClassInput = z.infer<typeof updateClassSchema>;

// ─── Member Note ─────────────────────────────────────────────
export const updateNoteSchema = z.object({
  content: z.string().max(5000),
});
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

// ─── Program (with RevenueCat product) ──────────────────────
export const createProgramWithRCSchema = createProgramSchema.extend({
  rc_product_id: z.string().max(200).optional().nullable(),
});
export type CreateProgramWithRCInput = z.infer<typeof createProgramWithRCSchema>;
