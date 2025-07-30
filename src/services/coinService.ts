// src/services/coinService.ts

export const COIN_PRICE_RUPEES = 2; // 1 coin costs 2 rupees to buy
export const COIN_VALUE_RUPEES = 1; // 1 coin is worth 1 rupee in barter

function getBalances(): Record<string, number> {
  return JSON.parse(localStorage.getItem('coinBalances') || '{}');
}

function setBalances(balances: Record<string, number>) {
  localStorage.setItem('coinBalances', JSON.stringify(balances));
}

export function getBalance(userId: string): number {
  const balances = getBalances();
  return balances[userId] || 0;
}

export function addCoins(userId: string, amount: number) {
  const balances = getBalances();
  balances[userId] = (balances[userId] || 0) + amount;
  setBalances(balances);
}

export function spendCoins(userId: string, amount: number): boolean {
  const balances = getBalances();
  if ((balances[userId] || 0) < amount) return false;
  balances[userId] -= amount;
  setBalances(balances);
  return true;
}

export function transferCoins(fromUserId: string, toUserId: string, amount: number): boolean {
  const balances = getBalances();
  if ((balances[fromUserId] || 0) < amount) return false;
  balances[fromUserId] -= amount;
  balances[toUserId] = (balances[toUserId] || 0) + amount;
  setBalances(balances);
  return true;
}