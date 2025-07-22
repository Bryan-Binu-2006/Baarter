import { User } from '../types/auth';

// Trust score weights (as per your concept)
const WEIGHTS = {
  verification: 0.2, // Profile completion
  endorsement: 0.25, // Not yet implemented
  reputation: 0.3,   // Not yet implemented
  dispute: 0.1,      // Not yet implemented
  behavior: 0.15,    // Not yet implemented
};

// Calculate trust score based on available data
export function calculateTrustScore(user: User): number {
  let score = 0;

  // Verification: profile completion (max 100 for this demo)
  let verification = 0;
  if (user.isProfileComplete) verification += 100;
  // You can add more checks (email, phone, etc.)
  score += verification * WEIGHTS.verification;

  // Endorsement, reputation, dispute, behavior: placeholder for now
  // These can be expanded as features are implemented
  // For now, new users start with a baseline
  score += 80 * (WEIGHTS.endorsement + WEIGHTS.reputation + WEIGHTS.dispute + WEIGHTS.behavior);

  // Clamp between 0 and 100
  return Math.round(Math.max(0, Math.min(100, score)));
}

// Optionally, add a function to update a user's trust score in localStorage
export function updateUserTrustScore(user: User): User {
  const trustScore = calculateTrustScore(user);
  const updatedUser = { ...user, trustScore };
  // Update currentUser
  localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  // Update allUsers
  const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
  const idx = allUsers.findIndex((u: User) => u.id === user.id);
  if (idx !== -1) {
    allUsers[idx] = updatedUser;
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
  }
  return updatedUser;
} 