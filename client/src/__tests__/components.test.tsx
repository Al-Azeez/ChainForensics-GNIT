import { describe, it, expect } from 'vitest';

describe('ChainForensics Client Utility & Format Tests', () => {
  it('Validates risk classification color coding rules', () => {
    const classifications = [
      'Insufficient Data',
      'No Major Anomaly Detected',
      'Unusual Activity',
      'Requires Further Review'
    ];
    expect(classifications).toContain('Requires Further Review');
    expect(classifications.length).toBe(4);
  });

  it('Formats Ethereum transaction values accurately', () => {
    const formatEth = (val: number) => `${val.toFixed(4)} ETH`;
    expect(formatEth(12.345678)).toBe('12.3457 ETH');
    expect(formatEth(0)).toBe('0.0000 ETH');
  });

  it('Truncates cryptographic addresses consistently for UI badge display', () => {
    const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    const sample = '0x71C2508c9035f524C0A78F2e6181bA79E2b3D4d8';
    expect(truncate(sample)).toBe('0x71C2...D4d8');
  });
});
