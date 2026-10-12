import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getOrganizations = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const { type, city, state, search } = req.query;

    const where: any = {};

    if (type) {
      where.type = type as any;
    }

    if (city) {
      where.city = { contains: city as string };
    }

    if (state) {
      where.state = { contains: state as string };
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
        { sportsOffered: { contains: search as string } },
      ];
    }

    const [total, organizations] = await Promise.all([
      prisma.organization.count({ where }),
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        include: {
          opportunities: {
            where: { status: 'PUBLISHED' },
            take: 2,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return sendSuccess(res, organizations, 'Organizations retrieved successfully', 200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('getOrganizations error:', error);
    return sendError(res, 'Failed to fetch organizations', 500);
  }
};

export const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const organization = await prisma.organization.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                avatarUrl: true,
              },
            },
          },
        },
        opportunities: {
          where: { status: 'PUBLISHED' },
          include: { sport: true },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!organization) {
      return sendError(res, 'Organization not found', 404);
    }

    return sendSuccess(res, organization, 'Organization details retrieved');
  } catch (error: any) {
    console.error('getOrganizationById error:', error);
    return sendError(res, 'Failed to fetch organization', 500);
  }
};

export const createOrganization = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return sendError(res, 'Unauthorized', 401);

    const {
      name,
      type,
      description,
      city,
      state,
      address,
      facilities,
      sportsOffered,
      logoUrl,
      website,
      contactEmail,
      contactPhone,
    } = req.body;

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;

    const organization = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name,
          slug,
          type: type || 'ACADEMY',
          description,
          city,
          state,
          address,
          facilities,
          sportsOffered,
          logoUrl,
          website,
          contactEmail,
          contactPhone,
          createdById: userId,
        },
      });

      // Add user as OWNER member
      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId,
          role: 'OWNER',
        },
      });

      return org;
    });

    return sendSuccess(res, organization, 'Organization created successfully', 201);
  } catch (error: any) {
    console.error('createOrganization error:', error);
    return sendError(res, 'Failed to create organization', 500);
  }
};
