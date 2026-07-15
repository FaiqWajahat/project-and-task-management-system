import { Request, Response, NextFunction } from "express";
import { query } from "../config/db";
import { comparePassword } from "../utils/password";
import { sendTokenCookie, clearTokenCookie, signToken } from "../utils/jwt";
import { loginSchema } from "../schemas/auth.schema";
import { AuthenticatedRequest } from "../middleware/auth";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Simple flat query to find user by email
    const result = await query(
      "SELECT id, name, email, password, role, \"createdAt\" FROM users WHERE email = $1",
      [validatedData.email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await comparePassword(validatedData.password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    sendTokenCookie(res, {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: userResponse,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Simple flat query to get user details
    const result = await query(
      `SELECT id, name, email, role, "createdAt", "updatedAt"
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    clearTokenCookie(res);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
}
