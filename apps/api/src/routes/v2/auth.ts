import express from "express";
import { Request, Response } from "express";
import {
  AuthResponseDto,
  CreateUserDto,
  LoginUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
  createUserSchema,
  loginUserSchema,
  updatePasswordSchema,
  updateUserSchema,
} from "../../schema/user.schema";
import { validateBody } from "../../middleware/validate.middleware";
import { AuthService } from "../../services/auth.service";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { requireAuth } from "../../middleware/auth.middleware";

const authRoutes = express.Router();
const authService = new AuthService();
const ACCESS_COOKIE_NAME = "access_token";
const REFRESH_COOKIE_NAME = "refresh_token";
const ACCESS_COOKIE_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const isProduction = process.env.NODE_ENV === "production";

const setAccessTokenCookie = (res: Response, accessToken: string) => {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: ACCESS_COOKIE_MAX_AGE_MS,
    path: "/",
  });
};

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: "/api/v2/auth",
  });
};

const clearAccessTokenCookie = (res: Response) => {
  res.clearCookie(ACCESS_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
  });
};

const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/api/v2/auth",
  });
};

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 example: sokmeak@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: Sokmeak
 *     responses:
 *       201:
 *         description: User registered and auth cookies set
 *       409:
 *         description: Email already exists
 */
authRoutes.post(
  "/register",
  validateBody(createUserSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password, name }: CreateUserDto = req.body;
      const user = await authService.createUser({ email, password, name });
      const access_token = generateAccessToken({
        id: user.id,
        email: user.email,
        name: user.name,
      });
      const refreshTokenPayload = generateRefreshToken(user.id);
      await authService.storeRefreshToken(
        user.id,
        refreshTokenPayload.token,
        refreshTokenPayload.expiresAt,
      );
      setAccessTokenCookie(res, access_token);
      setRefreshTokenCookie(res, refreshTokenPayload.token);

      const response: AuthResponseDto = { user };
      return res.status(201).json(response);
    } catch (error: any) {
      if (error.message === "User with this email already exists") {
        return res.status(409).json({ error: error.message });
      }

      console.error("Error registering user:", error);
      return res.status(500).json({ error: "Failed to register user" });
    }
  },
);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: sokmeak@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User logged in and auth cookies set
 *       401:
 *         description: Invalid email or password
 */
authRoutes.post(
  "/login",
  validateBody(loginUserSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password }: LoginUserDto = req.body;
      const user = await authService.validateUserCredentials(email, password);

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const access_token = generateAccessToken({
        id: user.id,
        email: user.email,
        name: user.name,
      });
      const refreshTokenPayload = generateRefreshToken(user.id);
      await authService.storeRefreshToken(
        user.id,
        refreshTokenPayload.token,
        refreshTokenPayload.expiresAt,
      );
      setAccessTokenCookie(res, access_token);
      setRefreshTokenCookie(res, refreshTokenPayload.token);

      const response: AuthResponseDto = { user };
      return res.json(response);
    } catch (error) {
      console.error("Error logging in user:", error);
      return res.status(500).json({ error: "Failed to login user" });
    }
  },
);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags:
 *       - Auth
 *     security:
 *       - accessCookieAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *       401:
 *         description: Unauthorized
 */
authRoutes.get("/me", requireAuth, async (req: Request, res: Response) => {
  return res.json({ user: req.authUser });
});

/**
 * @openapi
 * /auth/me:
 *   patch:
 *     summary: Update current user profile
 *     tags:
 *       - Auth
 *     security:
 *       - accessCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: sokmeak.new@example.com
 *               name:
 *                 type: string
 *                 example: Sokmeak New
 *     responses:
 *       200:
 *         description: Profile updated and auth cookie refreshed
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Email already exists
 */
authRoutes.patch(
  "/me",
  requireAuth,
  validateBody(updateUserSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.authUser!.id;
      const payload: UpdateUserDto = req.body;
      const updatedUser = await authService.updateUserProfile(userId, payload);

      const access_token = generateAccessToken({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      });
      setAccessTokenCookie(res, access_token);

      const response: AuthResponseDto = {
        user: updatedUser,
      };

      return res.json(response);
    } catch (error: any) {
      if (error.message === "User with this email already exists") {
        return res.status(409).json({ error: error.message });
      }

      if (error.message === "User not found") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to update profile" });
    }
  },
);

/**
 * @openapi
 * /auth/me/password:
 *   patch:
 *     summary: Update current user password
 *     tags:
 *       - Auth
 *     security:
 *       - accessCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 example: password123
 *               new_password:
 *                 type: string
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Current password is incorrect
 *       401:
 *         description: Unauthorized
 */
authRoutes.patch(
  "/me/password",
  requireAuth,
  validateBody(updatePasswordSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.authUser!.id;
      const payload: UpdatePasswordDto = req.body;
      await authService.updateUserPassword(userId, payload);
      return res.json({ success: true });
    } catch (error: any) {
      if (error.message === "Current password is incorrect") {
        return res.status(400).json({ error: error.message });
      }

      if (error.message === "User not found") {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({ error: "Failed to update password" });
    }
  },
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Rotate refresh token and set fresh auth cookies
 *     tags:
 *       - Auth
 *     security:
 *       - refreshCookieAuth: []
 *     responses:
 *       200:
 *         description: Auth cookies rotated
 *       401:
 *         description: Refresh token missing or invalid
 */
authRoutes.post("/refresh", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token missing" });
    }

    const payload = verifyRefreshToken(refreshToken);
    const isValidToken = await authService.isRefreshTokenValid(refreshToken);

    if (!isValidToken) {
      clearAccessTokenCookie(res);
      clearRefreshTokenCookie(res);
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const user = await authService.getUserById(payload.sub);
    if (!user) {
      clearAccessTokenCookie(res);
      clearRefreshTokenCookie(res);
      return res.status(401).json({ error: "Unauthorized" });
    }

    await authService.revokeRefreshToken(refreshToken);
    const nextRefreshTokenPayload = generateRefreshToken(user.id);
    await authService.storeRefreshToken(
      user.id,
      nextRefreshTokenPayload.token,
      nextRefreshTokenPayload.expiresAt,
    );
    setRefreshTokenCookie(res, nextRefreshTokenPayload.token);

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    setAccessTokenCookie(res, accessToken);

    return res.json({ success: true });
  } catch (error) {
    clearAccessTokenCookie(res);
    clearRefreshTokenCookie(res);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout user and clear refresh token cookie
 *     tags:
 *       - Auth
 *     security:
 *       - refreshCookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 */
authRoutes.post("/logout", async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (refreshToken) {
    await authService.revokeRefreshToken(refreshToken);
  }

  clearRefreshTokenCookie(res);
  clearAccessTokenCookie(res);
  return res.json({ success: true });
});

export default authRoutes;
