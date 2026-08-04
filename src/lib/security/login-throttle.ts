import prisma from "@/lib/database/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

export async function assertNotLocked(email: string) {
  const since = new Date(Date.now() - WINDOW_MS);
  const failedCount = await prisma.loginAttempt.count({
    where: { email, success: false, createdAt: { gte: since } },
  });

  if (failedCount >= MAX_FAILED_ATTEMPTS) {
    throw new Error("Too many failed login attempts. Please try again in 15 minutes.");
  }
}

export async function recordFailedAttempt(email: string, ip?: string) {
  await prisma.loginAttempt.create({ data: { email, ip, success: false } });
}

export async function recordSuccessfulAttempt(email: string, ip?: string) {
  await prisma.loginAttempt.create({ data: { email, ip, success: true } });
  // Reset the counter so a legitimate login isn't penalized by attempts prior to it.
  await prisma.loginAttempt.deleteMany({ where: { email, success: false } });
}
