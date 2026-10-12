import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getCoaches = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const { sportId, city, coachingMode, minExperience, search } = req.query;

    const where: any = {
      isAvailable: true,
      user: {
        role: 'COACH',
      },
    };

    if (sportId) {
      where.primarySportId = sportId as string;
    }

    if (city) {
      where.user.city = { contains: city as string };
    }

    if (coachingMode) {
      where.coachingModes = { contains: coachingMode as string };
    }

    if (minExperience) {
      where.experienceYears = { gte: parseInt(minExperience as string, 10) };
    }

    if (search) {
      where.user.name = { contains: search as string };
    }

    const [total, coaches] = await Promise.all([
      prisma.coachProfile.count({ where }),
      prisma.coachProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
              bio: true,
              avatarUrl: true,
            },
          },
          programs: {
            include: { sport: true },
            take: 3,
          },
        },
        orderBy: { experienceYears: 'desc' },
      }),
    ]);

    return sendSuccess(res, coaches, 'Coaches retrieved successfully', 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('getCoaches error:', error);
    return sendError(res, 'Failed to fetch coaches', 500);
  }
};

export const getCoachById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const coach = await prisma.coachProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
            bio: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
        programs: {
          include: { sport: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!coach) {
      return sendError(res, 'Coach not found', 404);
    }

    return sendSuccess(res, coach, 'Coach profile retrieved');
  } catch (error: any) {
    console.error('getCoachById error:', error);
    return sendError(res, 'Failed to fetch coach profile', 500);
  }
};

export const updateMyCoachProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const {
      primarySportId,
      qualifications,
      experienceYears,
      coachingMethodology,
      coachingModes,
      hourlyRate,
      isAvailable,
      organizationAffiliation,
    } = req.body;

    const updated = await prisma.coachProfile.upsert({
      where: { userId },
      update: {
        primarySportId,
        qualifications,
        experienceYears,
        coachingMethodology,
        coachingModes,
        hourlyRate,
        isAvailable,
        organizationAffiliation,
      },
      create: {
        userId,
        primarySportId,
        qualifications,
        experienceYears: experienceYears || 1,
        coachingMethodology,
        coachingModes,
        hourlyRate,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        organizationAffiliation,
      },
      include: {
        programs: true,
      },
    });

    return sendSuccess(res, updated, 'Coach profile updated successfully');
  } catch (error: any) {
    console.error('updateMyCoachProfile error:', error);
    return sendError(res, 'Failed to update coach profile', 500);
  }
};

export const addProgram = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const coach = await prisma.coachProfile.findUnique({ where: { userId } });
    if (!coach) return sendError(res, 'Coach profile not found', 404);

    const {
      sportId,
      title,
      description,
      durationWeeks,
      sessionsPerWeek,
      feeAmount,
      feeCurrency,
      coachingMode,
      location,
    } = req.body;

    const program = await prisma.coachingProgram.create({
      data: {
        coachId: coach.id,
        sportId,
        title,
        description,
        durationWeeks,
        sessionsPerWeek,
        feeAmount,
        feeCurrency: feeCurrency || 'INR',
        coachingMode: coachingMode || 'IN_PERSON',
        location,
      },
      include: {
        sport: true,
      },
    });

    return sendSuccess(res, program, 'Coaching program created successfully', 201);
  } catch (error: any) {
    console.error('addProgram error:', error);
    return sendError(res, 'Failed to create program', 500);
  }
};

export const deleteProgram = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const coach = await prisma.coachProfile.findUnique({ where: { userId } });
    if (!coach) return sendError(res, 'Coach profile not found', 404);

    const program = await prisma.coachingProgram.findFirst({
      where: { id, coachId: coach.id },
    });

    if (!program) return sendError(res, 'Program not found or unauthorized', 404);

    await prisma.coachingProgram.delete({ where: { id } });

    return sendSuccess(res, null, 'Program deleted successfully');
  } catch (error: any) {
    return sendError(res, 'Failed to delete program', 500);
  }
};
