import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string().uuid(),
    username: z.string().min(3),
    email: z.string().email().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const SHARED_CONSTANT = "Tingle Talk Shared";
