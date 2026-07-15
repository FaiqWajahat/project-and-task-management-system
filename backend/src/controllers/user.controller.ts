import { Response, NextFunction } from "express";
import { query } from "../config/db";
import { hashPassword } from "../utils/password";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema";
import { AuthenticatedRequest } from "../middleware/auth";
import crypto from "crypto";

export async function getAllUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const result = await query(
      `SELECT id, name, email, role, "createdAt", "updatedAt"
       FROM users
       ORDER BY "createdAt" DESC`
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.params.id as string;
    const result = await query(
      `SELECT id, name, email, role, "createdAt", "updatedAt"
       FROM users
       WHERE id = $1`,
      [userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const validatedData = createUserSchema.parse(req.body);

    const existingUserResult = await query(
      "SELECT id FROM users WHERE email = $1",
      [validatedData.email]
    );

    if (existingUserResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use",
      });
    }

    const hashedPassword = await hashPassword(validatedData.password);
    const userId = crypto.randomUUID();

    const insertResult = await query(
      `INSERT INTO users (id, name, email, password, role)
       VALUES ($1, $2, $3, $4, $5::user_role)
       RETURNING id, name, email, role, "createdAt"`,
      [userId, validatedData.name, validatedData.email, hashedPassword, validatedData.role]
    );

    return res.status(201).json({
      success: true,
      data: insertResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.params.id as string;
    const validatedData = updateUserSchema.parse(req.body);

    const userResult = await query(
      "SELECT id FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (validatedData.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(validatedData.name);
    }

    if (validatedData.email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(validatedData.email);
    }

    if (validatedData.role) {
      updates.push(`role = $${paramIndex++}::user_role`);
      values.push(validatedData.role);
    }

    if (validatedData.password) {
      const hashedPassword = await hashPassword(validatedData.password);
      updates.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    values.push(userId);
    const queryText = `
      UPDATE users
      SET ${updates.join(", ")}, "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, name, email, role, "createdAt", "updatedAt"
    `;

    const updateResult = await query(queryText, values);

    return res.status(200).json({
      success: true,
      data: updateResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.params.id as string;

    const userResult = await query(
      "SELECT id FROM users WHERE id = $1",
      [userId]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Do not allow deleting own account
    if (user.id === req.user?.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account",
      });
    }

    await query("DELETE FROM users WHERE id = $1", [userId]);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
