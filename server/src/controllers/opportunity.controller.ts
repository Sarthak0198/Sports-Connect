import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getOpportunities = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const { category, sportId, city, state, skillLevel, status, search } = req.query;

    const where: any = {};

    // By default only show published unless explicitly querying organizer's own
    if (status) {
      where.status = status as any;
    } else {
      where.status = 'PUBLISHED';
    }

    if (category) {
      where.category = category as any;
    }

    if (sportId) {
      where.sportId = sportId as string;
    }

    if (city) {
      where.city = { contains: city as string };
    }

    if (state) {
      where.state = { contains: state as string };
    }

    if (skillLevel) {
      where.skillLevel = skillLevel as any;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
        { venue: { contains: search as string } },
      ];
    }

    const currentUserId = req.user?.userId;

    const [total, opportunities] = await Promise.all([
      prisma.opportunity.count({ where }),
      prisma.opportunity.findMany({
        where,
        skip,
        take: limit,
        include: {
          sport: true,
          organization: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              type: true,
            },
          },
          organizer: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              applications: true,
              savedByUsers: true,
            },
          },
        },
        orderBy: { deadline: 'asc' },
      }),
    ]);

    // If user is authenticated, also check if they have saved or applied to each
    let userAppliedSet = new Set<string>();
    let userSavedSet = new Set<string>();

    if (currentUserId) {
      const [userApps, userSaves] = await Promise.all([
        prisma.opportunityApplication.findMany({
          where: {
            applicantId: currentUserId,
            opportunityId: { in: opportunities.map((o) => o.id) },
          },
          select: { opportunityId: true },
        }),
        prisma.savedOpportunity.findMany({
          where: {
            userId: currentUserId,
            opportunityId: { in: opportunities.map((o) => o.id) },
          },
          select: { opportunityId: true },
        }),
      ]);

      userAppliedSet = new Set(userApps.map((a) => a.opportunityId));
      userSavedSet = new Set(userSaves.map((s) => s.opportunityId));
    }

    const formattedOpportunities = opportunities.map((opp) => ({
      ...opp,
      hasApplied: userAppliedSet.has(opp.id),
      isSaved: userSavedSet.has(opp.id),
      applicantCount: opp._count.applications,
    }));

    return sendSuccess(res, formattedOpportunities, 'Opportunities retrieved successfully', 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('getOpportunities error:', error);
    return sendError(res, 'Failed to fetch opportunities', 500);
  }
};

export const getOpportunityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.userId;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        sport: true,
        organization: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
        _count: {
          select: {
            applications: true,
            savedByUsers: true,
          },
        },
      },
    });

    if (!opportunity) {
      return sendError(res, 'Opportunity not found', 404);
    }

    let hasApplied = false;
    let isSaved = false;
    let myApplication = null;

    if (currentUserId) {
      const [app, save] = await Promise.all([
        prisma.opportunityApplication.findUnique({
          where: {
            opportunityId_applicantId: {
              opportunityId: id,
              applicantId: currentUserId,
            },
          },
        }),
        prisma.savedOpportunity.findUnique({
          where: {
            userId_opportunityId: {
              userId: currentUserId,
              opportunityId: id,
            },
          },
        }),
      ]);

      hasApplied = !!app;
      myApplication = app;
      isSaved = !!save;
    }

    return sendSuccess(
      res,
      {
        ...opportunity,
        hasApplied,
        isSaved,
        myApplication,
        applicantCount: opportunity._count.applications,
      },
      'Opportunity details retrieved'
    );
  } catch (error: any) {
    console.error('getOpportunityById error:', error);
    return sendError(res, 'Failed to fetch opportunity', 500);
  }
};

export const createOpportunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const {
      title,
      description,
      category,
      sportId,
      organizationId,
      city,
      state,
      venue,
      startDate,
      endDate,
      deadline,
      eligibility,
      skillLevel,
      maxParticipants,
      applicationInstructions,
      feeAmount,
      feeCurrency,
      status,
      bannerUrl,
    } = req.body;

    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        description,
        category,
        sportId,
        organizerId: userId,
        organizationId,
        city,
        state,
        venue,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        deadline: new Date(deadline),
        eligibility,
        skillLevel: skillLevel || 'INTERMEDIATE',
        maxParticipants,
        applicationInstructions,
        feeAmount: feeAmount || 0,
        feeCurrency: feeCurrency || 'INR',
        status: status || 'PUBLISHED',
        bannerUrl,
      },
      include: {
        sport: true,
        organization: true,
      },
    });

    return sendSuccess(res, opportunity, 'Opportunity created successfully', 201);
  } catch (error: any) {
    console.error('createOpportunity error:', error);
    return sendError(res, 'Failed to create opportunity', 500);
  }
};

export const updateOpportunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'Opportunity not found', 404);

    if (existing.organizerId !== userId && req.user?.role !== 'ADMIN') {
      return sendError(res, 'Unauthorized to edit this opportunity', 403);
    }

    const {
      title,
      description,
      category,
      sportId,
      organizationId,
      city,
      state,
      venue,
      startDate,
      endDate,
      deadline,
      eligibility,
      skillLevel,
      maxParticipants,
      applicationInstructions,
      feeAmount,
      feeCurrency,
      status,
      bannerUrl,
    } = req.body;

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        title,
        description,
        category,
        sportId,
        organizationId,
        city,
        state,
        venue,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        eligibility,
        skillLevel,
        maxParticipants,
        applicationInstructions,
        feeAmount,
        feeCurrency,
        status,
        bannerUrl,
      },
      include: {
        sport: true,
      },
    });

    return sendSuccess(res, updated, 'Opportunity updated successfully');
  } catch (error: any) {
    console.error('updateOpportunity error:', error);
    return sendError(res, 'Failed to update opportunity', 500);
  }
};

export const updateOpportunityStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { status } = req.body;

    const existing = await prisma.opportunity.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'Opportunity not found', 404);

    if (existing.organizerId !== userId && req.user?.role !== 'ADMIN') {
      return sendError(res, 'Unauthorized', 403);
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: { status },
    });

    return sendSuccess(res, updated, `Opportunity status updated to ${status}`);
  } catch (error: any) {
    return sendError(res, 'Failed to update opportunity status', 500);
  }
};

export const toggleSaveOpportunity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id: opportunityId } = req.params;

    if (!userId) return sendError(res, 'Unauthorized', 401);

    const existing = await prisma.savedOpportunity.findUnique({
      where: {
        userId_opportunityId: {
          userId,
          opportunityId,
        },
      },
    });

    if (existing) {
      await prisma.savedOpportunity.delete({
        where: { id: existing.id },
      });
      return sendSuccess(res, { isSaved: false }, 'Opportunity removed from saved list');
    } else {
      await prisma.savedOpportunity.create({
        data: {
          userId,
          opportunityId,
        },
      });
      return sendSuccess(res, { isSaved: true }, 'Opportunity saved successfully');
    }
  } catch (error: any) {
    return sendError(res, 'Failed to toggle save opportunity', 500);
  }
};

export const getMySavedOpportunities = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const saved = await prisma.savedOpportunity.findMany({
      where: { userId },
      include: {
        opportunity: {
          include: {
            sport: true,
            organization: true,
          },
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    const items = saved.map((s) => ({
      ...s.opportunity,
      savedAt: s.savedAt,
      isSaved: true,
    }));

    return sendSuccess(res, items, 'Saved opportunities retrieved');
  } catch (error: any) {
    return sendError(res, 'Failed to fetch saved opportunities', 500);
  }
};
