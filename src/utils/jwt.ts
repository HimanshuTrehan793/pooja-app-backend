import jwt, { SignOptions } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { getEnvVar } from "./getEnvVar";
import { ApiError } from "./apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";

// Load keys from file
const privateKey = fs.readFileSync(
  path.resolve(getEnvVar("JWT_PRIVATE_KEY_PATH")),
  "utf8"
);
const publicKey = fs.readFileSync(
  path.resolve(getEnvVar("JWT_PUBLIC_KEY_PATH")),
  "utf8"
);

const accessTokenExpiry = getEnvVar(
  "JWT_ACCESS_TOKEN_EXPIRES_IN"
) as `${number}${"m" | "d" | "s" | "h"}`;
const refreshTokenExpiry = getEnvVar(
  "JWT_REFRESH_TOKEN_EXPIRES_IN"
) as `${number}${"m" | "d" | "s" | "h"}`;

interface AccessTokenPayload {
  sub: string;
  phone_number: string;
}

interface RefreshTokenPayload {
  sub: string;
}

export function generateAccessToken(
  userId: string,
  phone_number: string
): string {
  const payload: AccessTokenPayload = {
    sub: userId,
    phone_number,
  };

  const options: SignOptions = {
    algorithm: "RS256",
    expiresIn: accessTokenExpiry,
  };

  return jwt.sign(payload, privateKey, options);
}

export function generateRefreshToken(userId: string): string {
  const payload: RefreshTokenPayload = {
    sub: userId,
  };

  const options: SignOptions = {
    algorithm: "RS256",
    expiresIn: refreshTokenExpiry,
  };

  return jwt.sign(payload, privateKey, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as AccessTokenPayload;

    return payload;
  } catch (err) {
    throw new ApiError(
      "Invalid or expired access token",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as RefreshTokenPayload;

    return payload;
  } catch (err) {
    throw new ApiError(
      "Invalid or expired refresh token",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }
}
