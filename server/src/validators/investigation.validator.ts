import { z } from 'zod';

export const AnalyzeRequestSchema = z.object({
  identifier: z.string().min(1, 'Target identifier (wallet address or transaction hash) is required'),
  title: z.string().optional(),
  network: z.string().default('ethereum'),
  analysisScope: z.enum(['standard', 'deep', 'single_tx']).default('standard'),
  demoMode: z.boolean().default(false),
  demoScenarioId: z.string().optional()
});

export const UpdateInvestigationSchema = z.object({
  title: z.string().min(1).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const RegisterUserSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(1, 'Name is required')
});

export const LoginUserSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(1, 'Password is required')
});
