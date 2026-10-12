import { z } from 'zod';

export const applyOpportunitySchema = z.object({
  notes: z.string().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'UNDER_REVIEW',
    'SHORTLISTED',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN',
  ]),
  feedback: z.string().optional(),
});

export const connectionRequestSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
});

export const connectionRespondSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
});

export const coachingInquirySchema = z.object({
  coachId: z.string().min(1, 'Coach ID is required'),
  programId: z.string().optional(),
  sportId: z.string().optional(),
  message: z.string().min(10, 'Inquiry message must be at least 10 characters'),
});

export const respondInquirySchema = z.object({
  status: z.enum(['RESPONDED', 'ENROLLED', 'DECLINED']),
  responseMessage: z.string().min(2, 'Response message is required'),
});

export const reportSchema = z.object({
  reportedUserId: z.string().optional(),
  reportedOpportunityId: z.string().optional(),
  reason: z.string().min(3, 'Reason is required'),
  details: z.string().optional(),
});
