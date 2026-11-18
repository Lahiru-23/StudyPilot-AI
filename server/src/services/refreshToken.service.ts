
import RefreshToken from '../models/RefreshToken.js';
import { hashRefreshToken } from '../utils/tokenHash.js';

export async function saveRefreshToken(
  userId: string,
  token: string
): Promise<void> {
  const tokenHash = hashRefreshToken(token);

  await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
}

export async function revokeRefreshToken(
  token: string
): Promise<void> {
  const tokenHash = hashRefreshToken(token);

  await RefreshToken.updateOne(
    {
      tokenHash,
      revokedAt: null
    },
    {
      $set: {
        revokedAt: new Date()
      }
    }
  );
}

export async function isRefreshTokenActive(
  token: string
): Promise<boolean> {
  const tokenHash = hashRefreshToken(token);

  const storedToken = await RefreshToken.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() }
  });

  return Boolean(storedToken);
}
export async function rotateRefreshToken(
  userId: string,
  oldToken: string,
  newToken: string
): Promise<boolean> {
  const oldTokenHash = hashRefreshToken(oldToken);
  const newTokenHash = hashRefreshToken(newToken);

  // Save the new refresh token first
  await saveRefreshToken(userId, newToken);

  const now = new Date();

  // Atomically revoke the old token
  const rotatedToken = await RefreshToken.findOneAndUpdate(
    {
      userId,
      tokenHash: oldTokenHash,
      revokedAt: null,
      expiresAt: { $gt: now }
    },
    {
      $set: {
        revokedAt: now,
        replacedByTokenHash: newTokenHash
      }
    },
    {
      new: true
    }
  );

  // If another request already rotated the old token,
  // revoke the newly created token as well.
  if (!rotatedToken) {
    await RefreshToken.updateOne(
      {
        tokenHash: newTokenHash,
        revokedAt: null
      },
      {
        $set: {
          revokedAt: new Date()
        }
      }
    );

    return false;
  }

  return true;
}