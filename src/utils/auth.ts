import { User } from "@prisma/client";
import crypto from "crypto";
/**
 * Checks if the user's password was changed after the JWT was issued.
 *
 * @param user - Prisma User object
 * @param JWTTimestamp - timestamp from JWT (in seconds)
 * @returns true if password was changed after the JWT was issued
 */
export function changedPasswordAfter(
  user: User,
  JWTTimestamp: number
): boolean {
  if (user.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      user.passwordChangedAt.getTime() / 1000
    );
    return changedTimestamp > JWTTimestamp;
  }
  return false;
}

export const createPasswordResetToken = (user: User) => {
  const resetToken = crypto.randomBytes(36).toString("hex");

  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};
