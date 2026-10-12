import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma.js';
import { signToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, city, state, phone, bio } = req.body;

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 409);
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with corresponding role profile using Prisma transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
          role,
          city,
          state,
          phone,
          bio,
        },
      });

      // Initialize role-specific profile
      if (role === 'ATHLETE') {
        await tx.athleteProfile.create({
          data: {
            userId: user.id,
            skillLevel: 'INTERMEDIATE',
          },
        });
      } else if (role === 'COACH') {
        await tx.coachProfile.create({
          data: {
            userId: user.id,
            experienceYears: 1,
            isAvailable: true,
          },
        });
      }

      // Create welcome notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to Sports Connect! 🎉',
          message:
            'Your account has been created. Complete your sports profile to connect with coaches, academies, and trials.',
          type: 'SYSTEM',
        },
      });

      return user;
    });

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    const userSafe = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      city: newUser.city,
      state: newUser.state,
      phone: newUser.phone,
      bio: newUser.bio,
      avatarUrl: newUser.avatarUrl,
      createdAt: newUser.createdAt,
    };

    return sendSuccess(
      res,
      { user: userSafe, token },
      'Registration successful. Welcome to Sports Connect!',
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return sendError(res, 'Failed to complete registration.', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        athleteProfile: true,
        coachProfile: true,
        organizationMemberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const userSafe = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      city: user.city,
      state: user.state,
      phone: user.phone,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      athleteProfile: user.athleteProfile,
      coachProfile: user.coachProfile,
      organizationMemberships: user.organizationMemberships,
      createdAt: user.createdAt,
    };

    return sendSuccess(res, { user: userSafe, token }, 'Logged in successfully.');
  } catch (error: any) {
    console.error('Login error:', error);
    return sendError(res, 'Failed to log in.', 500);
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return sendError(res, 'Unauthorized.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        athleteProfile: {
          include: {
            achievements: { orderBy: { createdAt: 'desc' } },
            certificates: { orderBy: { createdAt: 'desc' } },
            statistics: { include: { sport: true }, orderBy: { createdAt: 'desc' } },
          },
        },
        coachProfile: {
          include: {
            programs: { include: { sport: true }, orderBy: { createdAt: 'desc' } },
          },
        },
        organizationMemberships: {
          include: {
            organization: true,
          },
        },
        userSports: {
          include: {
            sport: true,
          },
        },
      },
    });

    if (!user) {
      return sendError(res, 'User not found.', 404);
    }

    const { passwordHash, ...userSafe } = user;
    return sendSuccess(res, userSafe, 'User details retrieved.');
  } catch (error: any) {
    console.error('getMe error:', error);
    return sendError(res, 'Failed to fetch user profile.', 500);
  }
};
