"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPasswordResetToken = void 0;
exports.changedPasswordAfter = changedPasswordAfter;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Checks if the user's password was changed after the JWT was issued.
 *
 * @param user - Prisma User object
 * @param JWTTimestamp - timestamp from JWT (in seconds)
 * @returns true if password was changed after the JWT was issued
 */
function changedPasswordAfter(user, JWTTimestamp) {
    if (user.passwordChangedAt) {
        const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
        return changedTimestamp > JWTTimestamp;
    }
    return false;
}
const createPasswordResetToken = (user) => {
    const resetToken = crypto_1.default.randomBytes(36).toString("hex");
    user.passwordResetToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    user.passwordResetExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    return resetToken;
};
exports.createPasswordResetToken = createPasswordResetToken;
