import { z } from 'zod';

export const createOpportunitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'TRIAL',
    'TOURNAMENT',
    'CAMP',
    'TRAINING_PROGRAM',
    'ACADEMY_ADMISSION',
    'RECRUITMENT',
    'WORKSHOP',
  ]),
  sportId: z.string().min(1, 'Sport selection is required'),
  organizationId: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  venue: z.string().min(2, 'Venue details required'),
  startDate: z.string(),
  endDate: z.string(),
  deadline: z.string(),
  eligibility: z.string().optional(),
  skillLevel: z
    .enum([
      'BEGINNER',
      'INTERMEDIATE',
      'ADVANCED',
      'STATE_LEVEL',
      'NATIONAL_LEVEL',
      'INTERNATIONAL_LEVEL',
    ])
    .default('INTERMEDIATE'),
  maxParticipants: z.number().int().positive().optional(),
  applicationInstructions: z.string().optional(),
  feeAmount: z.number().min(0).default(0),
  feeCurrency: z.string().default('INR'),
  status: z
    .enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED'])
    .default('PUBLISHED'),
  bannerUrl: z.string().optional(),
});

export const updateOpportunitySchema = createOpportunitySchema.partial();

export const updateOpportunityStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED']),
});
