import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAthletes = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const { sportId, skillLevel, city, state, search } = req.query;

    const where: any = {
      isPublic: true,
      user: {
        role: 'ATHLETE',
      },
    };

    if (sportId) {
      where.primarySportId = sportId as string;
    }

    if (skillLevel) {
      where.skillLevel = skillLevel as any;
    }

    if (city) {
      where.user.city = { contains: city as string };
    }

    if (state) {
      where.user.state = { contains: state as string };
    }

    if (search) {
      where.user.name = { contains: search as string };
    }

    const [total, athletes] = await Promise.all([
      prisma.athleteProfile.count({ where }),
      prisma.athleteProfile.findMany({
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
          achievements: {
            take: 2,
            orderBy: { createdAt: 'desc' },
          },
          statistics: {
            take: 3,
            include: { sport: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return sendSuccess(res, athletes, 'Athletes retrieved successfully', 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('getAthletes error:', error);
    return sendError(res, 'Failed to fetch athletes', 500);
  }
};

export const getAthleteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const athlete = await prisma.athleteProfile.findFirst({
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
        achievements: {
          include: { sport: true },
          orderBy: { createdAt: 'desc' },
        },
        certificates: {
          orderBy: { createdAt: 'desc' },
        },
        statistics: {
          include: { sport: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!athlete) {
      return sendError(res, 'Athlete profile not found', 404);
    }

    return sendSuccess(res, athlete, 'Athlete profile retrieved');
  } catch (error: any) {
    console.error('getAthleteById error:', error);
    return sendError(res, 'Failed to fetch athlete profile', 500);
  }
};

export const updateMyAthleteProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const {
      primarySportId,
      skillLevel,
      playingPosition,
      yearsOfExperience,
      sportingGoals,
      preferredOpportunities,
      heightCm,
      weightKg,
      dateOfBirth,
      gender,
      isPublic,
      videoUrls,
    } = req.body;

    const updated = await prisma.athleteProfile.upsert({
      where: { userId },
      update: {
        primarySportId,
        skillLevel,
        playingPosition,
        yearsOfExperience,
        sportingGoals,
        preferredOpportunities,
        heightCm,
        weightKg,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        isPublic,
        videoUrls,
      },
      create: {
        userId,
        primarySportId,
        skillLevel: skillLevel || 'INTERMEDIATE',
        playingPosition,
        yearsOfExperience: yearsOfExperience || 0,
        sportingGoals,
        preferredOpportunities,
        heightCm,
        weightKg,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        isPublic: isPublic !== undefined ? isPublic : true,
        videoUrls,
      },
      include: {
        achievements: true,
        statistics: true,
        certificates: true,
      },
    });

    return sendSuccess(res, updated, 'Athlete profile updated successfully');
  } catch (error: any) {
    console.error('updateMyAthleteProfile error:', error);
    return sendError(res, 'Failed to update athlete profile', 500);
  }
};

export const addAchievement = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const profile = await prisma.athleteProfile.findUnique({ where: { userId } });
    if (!profile) return sendError(res, 'Athlete profile not found', 404);

    const { title, competitionName, rankOrAward, sportId, eventDate, description, certificateUrl } = req.body;

    const achievement = await prisma.athleteAchievement.create({
      data: {
        athleteProfileId: profile.id,
        title,
        competitionName,
        rankOrAward,
        sportId: sportId || profile.primarySportId,
        eventDate: eventDate ? new Date(eventDate) : undefined,
        description,
        certificateUrl,
      },
    });

    return sendSuccess(res, achievement, 'Achievement added successfully', 201);
  } catch (error: any) {
    console.error('addAchievement error:', error);
    return sendError(res, 'Failed to add achievement', 500);
  }
};

export const deleteAchievement = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const profile = await prisma.athleteProfile.findUnique({ where: { userId } });
    if (!profile) return sendError(res, 'Athlete profile not found', 404);

    const achievement = await prisma.athleteAchievement.findFirst({
      where: { id, athleteProfileId: profile.id },
    });

    if (!achievement) return sendError(res, 'Achievement not found or unauthorized', 404);

    await prisma.athleteAchievement.delete({ where: { id } });

    return sendSuccess(res, null, 'Achievement deleted successfully');
  } catch (error: any) {
    return sendError(res, 'Failed to delete achievement', 500);
  }
};

export const addStatistic = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const profile = await prisma.athleteProfile.findUnique({ where: { userId } });
    if (!profile) return sendError(res, 'Athlete profile not found', 404);

    const { sportId, metricName, metricValue, unit, recordedDate, season } = req.body;

    const stat = await prisma.athleteStatistic.create({
      data: {
        athleteProfileId: profile.id,
        sportId: sportId || profile.primarySportId || '',
        metricName,
        metricValue,
        unit,
        recordedDate: recordedDate ? new Date(recordedDate) : undefined,
        season,
      },
    });

    return sendSuccess(res, stat, 'Statistic recorded successfully', 201);
  } catch (error: any) {
    return sendError(res, 'Failed to record statistic', 500);
  }
};

export const deleteStatistic = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const profile = await prisma.athleteProfile.findUnique({ where: { userId } });
    if (!profile) return sendError(res, 'Athlete profile not found', 404);

    const stat = await prisma.athleteStatistic.findFirst({
      where: { id, athleteProfileId: profile.id },
    });

    if (!stat) return sendError(res, 'Statistic not found or unauthorized', 404);

    await prisma.athleteStatistic.delete({ where: { id } });

    return sendSuccess(res, null, 'Statistic deleted successfully');
  } catch (error: any) {
    return sendError(res, 'Failed to delete statistic', 500);
  }
};
