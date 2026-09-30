/**
 * Ethiopian Birr & Ge'ez Numeral Utilities
 * Inspired by authentic Ethiopian Banknote typography (1, 5, 10, 100 Birr)
 */

export function toGeezNumber(num: number): string {
  if (num === 1) return '፩';
  if (num === 5) return '፭';
  if (num === 10) return '፲';
  if (num === 50) return '፶';
  if (num === 100) return '፻';
  if (num === 250) return '፪፻፶';
  if (num === 500) return '፭፻';
  if (num === 1000) return '፩ሺ';
  if (num === 2500) return '፪ሺ፭፻';
  if (num === 5000) return '፭ሺ';
  if (num === 10000) return '፲ሺ';
  if (num === 50000) return '፶ሺ';
  if (num === 100000) return '፻ሺ';

  // Fallback composite generator for common numbers
  if (num < 10) {
    const digits = ['', '፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱'];
    return digits[num] || num.toString();
  }
  if (num < 100) {
    const tens = ['', '፲', '፳', '፴', '፵', '፶', '፷', '፸', '፹'];
    const tenPart = tens[Math.floor(num / 10)] || '';
    const rem = num % 10;
    const digits = ['', '፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱'];
    return `${tenPart}${digits[rem] || ''}`;
  }
  if (num < 1000) {
    const hundreds = Math.floor(num / 100);
    const rem = num % 100;
    const hPrefix = hundreds === 1 ? '፻' : `${toGeezNumber(hundreds)}፻`;
    return rem > 0 ? `${hPrefix}${toGeezNumber(rem)}` : hPrefix;
  }
  
  return `${num.toLocaleString()} ብር`;
}

export function formatBanknoteAmount(amount: number): { latin: string; geez: string } {
  return {
    latin: `${amount.toLocaleString()} ETB`,
    geez: `${toGeezNumber(amount)} : ብር`,
  };
}

export function generateCertificateId(serial = ''): string {
  const stamp = Math.floor(100000 + Math.random() * 900000);
  return `LW-ETB-${stamp}`;
}
