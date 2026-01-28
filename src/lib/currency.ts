export function convertUsdToSrd(usdAmount: number, exchangeRate: number): number {
  return usdAmount * exchangeRate;
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatSrd(amount: number): string {
  return new Intl.NumberFormat("nl-SR", {
    style: "currency",
    currency: "SRD",
  }).format(amount);
}

export function formatCurrency(
  usdAmount: number,
  exchangeRate: number,
  showBoth: boolean = true
): { usd: string; srd: string } {
  const srdAmount = convertUsdToSrd(usdAmount, exchangeRate);
  return {
    usd: formatUsd(usdAmount),
    srd: formatSrd(srdAmount),
  };
}
