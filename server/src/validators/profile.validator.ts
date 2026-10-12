import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const updateAthleteSchema = z.object({
  primarySportId: z.string().optional(),
  skillLevel: z
    .enum([
      'BEGINNER',
      'INTERMEDIATE',
      'ADVANCED',
      'STATE_LEVEL',
      'NATIONAL_LEVEL',
      'INTERNATIONAL_LEVEL',
    ])
    .optional(),
  playingPosition: z.string().optional(),
  yearsOfExperience: z.number().int().min(0).optional(),
  sportingGoals: z.string().optional(),
  preferredOpportunities: z.string().optional(),
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  dateOfBirth: z.string().datetime().optional().or(z.string().optional()),
  gender: z.string().optional(),
  isPublic: z.boolean().optional(),
  videoUrls: z.string().optional(),
});

export const achievementSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  competitionName: z.string().min(2, 'Competition name is required'),
  rankOrAward: z.string().min(1, 'Award or rank is required'),
  sportId: z.string().optional(),
  eventDate: z.string().optional(),
  description: z.string().optional(),
  certificateUrl: z.string().optional(),
});

export const statisticSchema = z.object({
  sportId: z.string().min(1, 'Sport is required'),
  metricName: z.string().min(1, 'Metric name is required'),
  metricValue: z.string().min(1, 'Metric value is required'),
  unit: z.string().optional(),
  recordedDate: z.string().optional(),
  season: z.string().optional(),
});

export const updateCoachSchema = z.object({
  primarySportId: z.string().optional(),
  qualifications: z.string().optional(),
  experienceYears: z.number().int().min(0).optional(),
  coachingMethodology: z.string().optional(),
  coachingModes: z.string().optional(),
  hourlyRate: z.number().positive().optional(),
  isAvailable: z.boolean().optional(),
  organizationAffiliation: z.string().optional(),
});

export const coachingProgramSchema = z.object({
  sportId: z.string().min(1, 'Sport is required'),
  title: z.string().min(2, 'Program title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  durationWeeks: z.number().int().positive().default(4),
  sessionsPerWeek: z.number().int().positive().default(3),
  feeAmount: z.number().min(0).default(0),
  feeCurrency: z.string().default('INR'),
  coachingMode: z.string().default('IN_PERSON'),
  location: z.string().optional(),
});
