/**
 * KoMMoctoChain Address Mapper
 * Developed by KI Assi Mende (Manus AI) for Kommuniverse / HappyDevMod Studio
 * 
 * Maps standard EVM addresses (0x...) deterministically to the proprietary
 * Mixed-Polarity-Octet format (±X.±X.±X.±X) where each value ranges from -8 to +8.
 */

export interface KoMMoctoAddress {
  x1: number; // -8 to +8
  x2: number; // -8 to +8
  x3: number; // -8 to +8
  x4: number; // -8 to +8
  formatted: string; // e.g. "+4.-4.+4.-4"
  polarity: 'positive' | 'negative' | 'origin';
}

/**
 * Deterministically maps an EVM hex address to a KoMMoctoChain 4D address.
 * @param evmAddress Standard Ethereum address (0x...)
 */
export function mapEvmToKoMMocto(evmAddress: string): KoMMoctoAddress {
  if (!evmAddress || !evmAddress.startsWith('0x')) {
    throw new Error('Invalid EVM address format');
  }

  // Remove 0x and take the first 8 characters for hashing/mapping
  const cleanHex = evmAddress.toLowerCase().replace('0x', '').padEnd(8, '0');
  
  // Convert chunks of 2 hex chars into numbers and map them to the range [-8, +8]
  const chunks = [
    parseInt(cleanHex.substring(0, 2), 16),
    parseInt(cleanHex.substring(2, 4), 16),
    parseInt(cleanHex.substring(4, 6), 16),
    parseInt(cleanHex.substring(6, 8), 16),
  ];

  // Map 0-255 to -8 to +8 (17 possible values)
  // Formula: Math.round((val / 255) * 16) - 8
  const octet = chunks.map(val => {
    const mapped = Math.round((val / 255) * 16) - 8;
    // Ensure bounds [-8, 8]
    return Math.max(-8, Math.min(8, mapped));
  });

  const [x1, x2, x3, x4] = octet;

  // Format with explicit signs
  const formatVal = (v: number) => (v >= 0 ? `+${v}` : `${v}`);
  const formatted = `${formatVal(x1)}.${formatVal(x2)}.${formatVal(x3)}.${formatVal(x4)}`;

  // Determine polarity based on sum or primary core
  let polarity: 'positive' | 'negative' | 'origin' = 'positive';
  const sum = x1 + x2 + x3 + x4;
  if (sum === 0) {
    polarity = 'origin';
  } else if (sum < 0) {
    polarity = 'negative';
  }

  return {
    x1,
    x2,
    x3,
    x4,
    formatted,
    polarity,
  };
}

/**
 * Example utility to verify the Genesis Origin Address (0.0.0.0)
 */
export function getOriginAddress(): KoMMoctoAddress {
  return {
    x1: 0,
    x2: 0,
    x3: 0,
    x4: 0,
    formatted: "+0.+0.+0.+0",
    polarity: "origin",
  };
}
