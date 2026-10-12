import { NormalizedTransaction } from './blockchain.service.js';

export interface DemoScenario {
  id: string;
  name: string;
  category: string;
  targetAddress: string;
  description: string;
  expectedClassification: string;
  transactions: NormalizedTransaction[];
}

const BASE_TIME = 1773000000; // Deterministic benchmark epoch

export const DEMO_SCENARIOS: Record<string, DemoScenario> = {
  layering_peeling: {
    id: 'layering_peeling',
    name: 'Suspicious Pass-Through & Peeling Relay',
    category: 'Anomalous Fund Routing',
    targetAddress: '0x71C2508c9035f524C0A78F2e6181bA79E2b3D4d8',
    description: 'Deterministic sample demonstrating rapid fund pass-through (< 5 min latency between deposits and withdrawals), high counterparty dispersion, and 98% balance depletion.',
    expectedClassification: 'Requires Further Review',
    transactions: [
      {
        hash: '0xaa10000000000000000000000000000000000000000000000000000000000001',
        from_address: '0x1010101010101010101010101010101010101010',
        to_address: '0x71C2508c9035f524C0A78F2e6181bA79E2b3D4d8',
        value_eth: 24.5,
        timestamp: BASE_TIME - 7200,
        block_number: 21500100,
        gas_price_gwei: 28.5,
        gas_used: 21000,
        is_error: false,
        method: 'Transfer / Native ETH'
      },
      {
        hash: '0xaa10000000000000000000000000000000000000000000000000000000000002',
        from_address: '0x71C2508c9035f524C0A78F2e6181bA79E2b3D4d8',
        to_address: '0x2020202020202020202020202020202020202020',
        value_eth: 12.2,
        timestamp: BASE_TIME - 7020, // 3 mins after deposit
        block_number: 21500115,
        gas_price_gwei: 32.0,
        gas_used: 21000,
        is_error: false,
        method: 'Transfer / Native ETH'
      },
      {
        hash: '0xaa10000000000000000000000000000000000000000000000000000000000003',
        from_address: '0x71C2508c9035f524C0A78F2e6181bA79E2b3D4d8',
        to_address: '0x3030303030303030303030303030303030303030',
        value_eth: 12.1,
        timestamp: BASE_TIME - 6900, // 5 mins after deposit
        block_number: 21500125,
        gas_price_gwei: 31.5,
        gas_used: 21000,
        is_error: false,
        method: 'Transfer / Native ETH'
      },
      {
        hash: '0xaa10000000000000000000000000000000000000000000000000000000000004',
        from_address: '0x4040404040404040404040404040404040404040',
        to_address: '0x71C2508c9035f524C0A78F2e6181bA79E2b3D4d8',
        value_eth: 18.0,
        timestamp: BASE_TIME - 3600,
        block_number: 21500300,
        gas_price_gwei: 27.0,
        gas_used: 21000,
        is_error: false,
        method: 'Transfer / Native ETH'
      },
      {
        hash: '0xaa10000000000000000000000000000000000000000000000000000000000005',
        from_address: '0x71C2508c9035f524C0A78F2e6181bA79E2b3D4d8',
        to_address: '0x5050505050505050505050505050505050505050',
        value_eth: 17.85,
        timestamp: BASE_TIME - 3420, // 3 mins after
        block_number: 21500315,
        gas_price_gwei: 35.0,
        gas_used: 21000,
        is_error: false,
        method: 'Transfer / Native ETH'
      }
    ]
  },

  mev_bot_burst: {
    id: 'mev_bot_burst',
    name: 'High-Velocity Automated Arbitrage / Exploit Probing',
    category: 'Bot Execution & Reversions',
    targetAddress: '0x388C818CA8B9251b393131C08a736829cc7071A9',
    description: 'Deterministic sample with rapid micro-interval bursts, high reversion/failure rates (33%), and high counterparty entropy.',
    expectedClassification: 'Unusual Activity',
    transactions: [
      {
        hash: '0xbb20000000000000000000000000000000000000000000000000000000000001',
        from_address: '0x388C818CA8B9251b393131C08a736829cc7071A9',
        to_address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
        value_eth: 4.5,
        timestamp: BASE_TIME - 1800,
        block_number: 21500400,
        gas_price_gwei: 85.0,
        gas_used: 185000,
        is_error: true,
        method: 'Contract Call (0xa9059cbb)'
      },
      {
        hash: '0xbb20000000000000000000000000000000000000000000000000000000000002',
        from_address: '0x388C818CA8B9251b393131C08a736829cc7071A9',
        to_address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        value_eth: 4.5,
        timestamp: BASE_TIME - 1780,
        block_number: 21500401,
        gas_price_gwei: 92.0,
        gas_used: 240000,
        is_error: false,
        method: 'Contract Call (0x38ed1739)'
      },
      {
        hash: '0xbb20000000000000000000000000000000000000000000000000000000000003',
        from_address: '0x388C818CA8B9251b393131C08a736829cc7071A9',
        to_address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        value_eth: 0.0,
        timestamp: BASE_TIME - 1760,
        block_number: 21500402,
        gas_price_gwei: 110.0,
        gas_used: 120000,
        is_error: true,
        method: 'ERC-20 transfer(address,uint256)'
      }
    ]
  },

  benign_retail: {
    id: 'benign_retail',
    name: 'Benign Retail Investor & Staking Entity',
    category: 'Standard User Profile',
    targetAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    description: 'Deterministic benchmark showing regular organic holding periods (days/weeks), low turnover ratio, and zero contract execution failures.',
    expectedClassification: 'No Major Anomaly Detected',
    transactions: [
      {
        hash: '0xcc30000000000000000000000000000000000000000000000000000000000001',
        from_address: '0x28C6c06298d514Db089934071355E5743bf21d60',
        to_address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        value_eth: 3.2,
        timestamp: BASE_TIME - 864000, // 10 days ago
        block_number: 21450000,
        gas_price_gwei: 15.0,
        gas_used: 21000,
        is_error: false,
        method: 'Transfer / Native ETH'
      },
      {
        hash: '0xcc30000000000000000000000000000000000000000000000000000000000002',
        from_address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        to_address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        value_eth: 1.5,
        timestamp: BASE_TIME - 432000, // 5 days ago
        block_number: 21475000,
        gas_price_gwei: 18.0,
        gas_used: 95000,
        is_error: false,
        method: 'Contract Call (0xa1903eab)'
      },
      {
        hash: '0xcc30000000000000000000000000000000000000000000000000000000000003',
        from_address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        to_address: '0x5555555555555555555555555555555555555555',
        value_eth: 0.25,
        timestamp: BASE_TIME - 86400, // 1 day ago
        block_number: 21495000,
        gas_price_gwei: 14.0,
        gas_used: 21000,
        is_error: false,
        method: 'Transfer / Native ETH'
      }
    ]
  },

  privacy_mixer_funnel: {
    id: 'privacy_mixer_funnel',
    name: 'DeFi Privacy Mixer & High-Velocity Obfuscation Funnel',
    category: 'Obfuscation & Mixer Interactivity',
    targetAddress: '0x52AA899454998be5b000Ad077a46Bbe360F4e497',
    description: 'Deterministic benchmark demonstrating rapid fixed-denomination fan-out structuring (10.0 ETH slices), rapid churn into intermediate unverified hops, and 99.5% balance depletion.',
    expectedClassification: 'High Risk Obfuscation',
    transactions: [
      {
        hash: '0xdd40000000000000000000000000000000000000000000000000000000000001',
        from_address: '0x098B716B8Aaf21512996dC57EB0615e2383E2f96',
        to_address: '0x52AA899454998be5b000Ad077a46Bbe360F4e497',
        value_eth: 50.0,
        timestamp: BASE_TIME - 14400,
        block_number: 21500000,
        gas_price_gwei: 35.0,
        gas_used: 21000,
        is_error: false,
        method: 'Transfer / Native ETH'
      },
      {
        hash: '0xdd40000000000000000000000000000000000000000000000000000000000002',
        from_address: '0x52AA899454998be5b000Ad077a46Bbe360F4e497',
        to_address: '0x12D66f87A04A9E220743712cE6d9bB1B5616B8Fc',
        value_eth: 10.0,
        timestamp: BASE_TIME - 14200, // 3.3 mins after
        block_number: 21500016,
        gas_price_gwei: 42.0,
        gas_used: 120000,
        is_error: false,
        method: 'Privacy Pool Deposit (0xb214faa5)'
      },
      {
        hash: '0xdd40000000000000000000000000000000000000000000000000000000000003',
        from_address: '0x52AA899454998be5b000Ad077a46Bbe360F4e497',
        to_address: '0x47CE0C6eD5B0Ce3d3A51fdb1C52DC66a7c3c2936',
        value_eth: 10.0,
        timestamp: BASE_TIME - 14050, // 5.8 mins after
        block_number: 21500028,
        gas_price_gwei: 45.0,
        gas_used: 120000,
        is_error: false,
        method: 'Privacy Pool Deposit (0xb214faa5)'
      },
      {
        hash: '0xdd40000000000000000000000000000000000000000000000000000000000004',
        from_address: '0x52AA899454998be5b000Ad077a46Bbe360F4e497',
        to_address: '0x910Cbd523D972eb0a6f4cAe4618aD62622b39DbF',
        value_eth: 10.0,
        timestamp: BASE_TIME - 13900,
        block_number: 21500040,
        gas_price_gwei: 44.0,
        gas_used: 120000,
        is_error: false,
        method: 'Privacy Pool Deposit (0xb214faa5)'
      },
      {
        hash: '0xdd40000000000000000000000000000000000000000000000000000000000005',
        from_address: '0x52AA899454998be5b000Ad077a46Bbe360F4e497',
        to_address: '0xA160A4B310240055cf25230802711f958c219661',
        value_eth: 10.0,
        timestamp: BASE_TIME - 13750,
        block_number: 21500052,
        gas_price_gwei: 48.0,
        gas_used: 120000,
        is_error: false,
        method: 'Privacy Pool Deposit (0xb214faa5)'
      },
      {
        hash: '0xdd40000000000000000000000000000000000000000000000000000000000006',
        from_address: '0x52AA899454998be5b000Ad077a46Bbe360F4e497',
        to_address: '0xD4B88Df4D29F5CedD6857912842cff3b20C8Cfa3',
        value_eth: 9.85,
        timestamp: BASE_TIME - 13600,
        block_number: 21500065,
        gas_price_gwei: 50.0,
        gas_used: 21000,
        is_error: false,
        method: 'Transfer / Native ETH'
      }
    ]
  },

  cex_sweep_consolidator: {
    id: 'cex_sweep_consolidator',
    name: 'Centralized Exchange Sweep & Liquidity Aggregator',
    category: 'Exchange Sweep / Aggregation',
    targetAddress: '0x28C6c06298d514Db089934071355E5743bf21d60',
    description: 'Deterministic benchmark exhibiting massive fan-in aggregation from 5 distinct feeder addresses swept into an omnibus cold vault within seconds.',
    expectedClassification: 'Exchange Liquidity / Sweep Node',
    transactions: [
      {
        hash: '0xee50000000000000000000000000000000000000000000000000000000000001',
        from_address: '0x8811111111111111111111111111111111111111',
        to_address: '0x28C6c06298d514Db089934071355E5743bf21d60',
        value_eth: 45.0,
        timestamp: BASE_TIME - 5000,
        block_number: 21500200,
        gas_price_gwei: 25.0,
        gas_used: 21000,
        is_error: false,
        method: 'Deposit Inflow'
      },
      {
        hash: '0xee50000000000000000000000000000000000000000000000000000000000002',
        from_address: '0x8822222222222222222222222222222222222222',
        to_address: '0x28C6c06298d514Db089934071355E5743bf21d60',
        value_eth: 30.5,
        timestamp: BASE_TIME - 4950,
        block_number: 21500204,
        gas_price_gwei: 25.0,
        gas_used: 21000,
        is_error: false,
        method: 'Deposit Inflow'
      },
      {
        hash: '0xee50000000000000000000000000000000000000000000000000000000000003',
        from_address: '0x8833333333333333333333333333333333333333',
        to_address: '0x28C6c06298d514Db089934071355E5743bf21d60',
        value_eth: 75.0,
        timestamp: BASE_TIME - 4900,
        block_number: 21500208,
        gas_price_gwei: 26.0,
        gas_used: 21000,
        is_error: false,
        method: 'Deposit Inflow'
      },
      {
        hash: '0xee50000000000000000000000000000000000000000000000000000000000004',
        from_address: '0x8844444444444444444444444444444444444444',
        to_address: '0x28C6c06298d514Db089934071355E5743bf21d60',
        value_eth: 20.0,
        timestamp: BASE_TIME - 4850,
        block_number: 21500212,
        gas_price_gwei: 24.0,
        gas_used: 21000,
        is_error: false,
        method: 'Deposit Inflow'
      },
      {
        hash: '0xee50000000000000000000000000000000000000000000000000000000000005',
        from_address: '0x28C6c06298d514Db089934071355E5743bf21d60',
        to_address: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8', // Binance Cold Storage
        value_eth: 170.0,
        timestamp: BASE_TIME - 4700,
        block_number: 21500224,
        gas_price_gwei: 30.0,
        gas_used: 21000,
        is_error: false,
        method: 'Omnibus Cold Vault Sweep'
      }
    ]
  },

  polygon_bridge: {
    id: 'polygon_bridge',
    name: 'Polygon PoS State Receiver & Asset Bridge',
    category: 'Cross-Chain Infrastructure',
    targetAddress: '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf',
    description: 'High-throughput cross-chain bridge gateway handling batch token locks, state sync events, and validator root checkpoints across Polygon and Ethereum.',
    expectedClassification: 'Bridge / Infrastructure Gateway',
    transactions: [
      {
        hash: '0x11a0000000000000000000000000000000000000000000000000000000000001',
        from_address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        to_address: '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf',
        value_eth: 50.0,
        timestamp: BASE_TIME - 3600,
        block_number: 62001000,
        gas_price_gwei: 35.0,
        gas_used: 110000,
        is_error: false,
        method: 'Deposit For (0xe2bbb158)'
      },
      {
        hash: '0x11a0000000000000000000000000000000000000000000000000000000000002',
        from_address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        to_address: '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf',
        value_eth: 120.5,
        timestamp: BASE_TIME - 3400,
        block_number: 62001050,
        gas_price_gwei: 40.0,
        gas_used: 115000,
        is_error: false,
        method: 'Deposit For (0xe2bbb158)'
      },
      {
        hash: '0x11a0000000000000000000000000000000000000000000000000000000000003',
        from_address: '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf',
        to_address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        value_eth: 35.0,
        timestamp: BASE_TIME - 2800,
        block_number: 62001200,
        gas_price_gwei: 32.0,
        gas_used: 95000,
        is_error: false,
        method: 'Exit Release (0x8bb48227)'
      },
      {
        hash: '0x11a0000000000000000000000000000000000000000000000000000000000004',
        from_address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
        to_address: '0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf',
        value_eth: 85.0,
        timestamp: BASE_TIME - 1200,
        block_number: 62001600,
        gas_price_gwei: 38.0,
        gas_used: 110000,
        is_error: false,
        method: 'Deposit For (0xe2bbb158)'
      }
    ]
  },

  bsc_hot_wallet: {
    id: 'bsc_hot_wallet',
    name: 'Binance Hot Wallet Sweep Hub (BSC)',
    category: 'Exchange Sweep / Aggregation',
    targetAddress: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
    description: 'Centralized high-capacity liquidity transit wallet on BNB Smart Chain orchestrating deposit sweeps and hot-to-cold reserve balancing.',
    expectedClassification: 'Exchange Liquidity / Sweep Node',
    transactions: [
      {
        hash: '0x22b0000000000000000000000000000000000000000000000000000000000001',
        from_address: '0x9999000000000000000000000000000000000001',
        to_address: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
        value_eth: 50.0,
        timestamp: BASE_TIME - 2500,
        block_number: 44001000,
        gas_price_gwei: 3.0,
        gas_used: 21000,
        is_error: false,
        method: 'Deposit Inflow'
      },
      {
        hash: '0x22b0000000000000000000000000000000000000000000000000000000000002',
        from_address: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
        to_address: '0x0000000000000000000000000000000000001004',
        value_eth: 48.5,
        timestamp: BASE_TIME - 2200,
        block_number: 44001050,
        gas_price_gwei: 3.0,
        gas_used: 21000,
        is_error: false,
        method: 'Cold Vault Sweep'
      }
    ]
  },

  arbitrum_sequencer: {
    id: 'arbitrum_sequencer',
    name: 'Arbitrum One Sequencer Inbox',
    category: 'L2 Rollup Infrastructure',
    targetAddress: '0x165C6C6f27232231362e4D751CffCE8A4a8383B8',
    description: 'Arbitrum Rollup sequencer batch inbox receiving periodic L2 state execution assertions and compression calldata.',
    expectedClassification: 'Rollup Infrastructure / Sequencer',
    transactions: [
      {
        hash: '0x33c0000000000000000000000000000000000000000000000000000000000001',
        from_address: '0xC1b634853Cb333D3aD8663715b08f41A3Aec47CC',
        to_address: '0x165C6C6f27232231362e4D751CffCE8A4a8383B8',
        value_eth: 0.15,
        timestamp: BASE_TIME - 1800,
        block_number: 180001000,
        gas_price_gwei: 0.1,
        gas_used: 850000,
        is_error: false,
        method: 'Add Sequencer L2 Batch (0x8f111f3c)'
      }
    ]
  },

  binance_cold_storage_btc: {
    id: 'binance_cold_storage_btc',
    name: 'Binance Cold Storage Reserve (BTC)',
    category: 'Exchange Cold Storage Vault',
    targetAddress: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo',
    description: 'Premier Bitcoin multisig cold storage reserve vault holding hundreds of thousands of BTC with massive multi-input UTXO sweep consolidations and disciplined institutional custody.',
    expectedClassification: 'Exchange Cold Storage Reserve',
    transactions: [
      {
        hash: '9e4f03529d9da12cf0dc619fb4ffd4c1850b813a33e0fed7074188eb33688b16',
        from_address: 'bc1qc53gxysfrynjh5cmlpatwak3zlq9qczvl0m709',
        to_address: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo',
        value_eth: 250.0,
        timestamp: BASE_TIME - 7200,
        block_number: 890000,
        gas_price_gwei: 0.00025,
        gas_used: 285,
        is_error: false,
        method: 'UTXO Cold Reserve Sweep'
      },
      {
        hash: '8f3e02519d8da12cf0dc619fb4ffd4c1850b813a33e0fed7074188eb33688a15',
        from_address: '1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ',
        to_address: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo',
        value_eth: 180.5,
        timestamp: BASE_TIME - 5400,
        block_number: 890015,
        gas_price_gwei: 0.0003,
        gas_used: 310,
        is_error: false,
        method: 'UTXO Hot-to-Cold Balancing'
      },
      {
        hash: '7d2d01408c7ca01be0cb508ea3eec3b0740a702922d0edc6063077da22577904',
        from_address: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo',
        to_address: 'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97',
        value_eth: 50.0,
        timestamp: BASE_TIME - 3600,
        block_number: 890035,
        gas_price_gwei: 0.00028,
        gas_used: 290,
        is_error: false,
        method: 'Cold Reserve Outflow'
      }
    ]
  },

  satoshi_genesis_btc: {
    id: 'satoshi_genesis_btc',
    name: 'Satoshi Nakamoto Genesis Vault (BTC)',
    category: 'Historical Milestone',
    targetAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    description: 'The historic Genesis block 0 address created by Satoshi Nakamoto on January 3, 2009, recipient of community tribute micro-transfers with zero outbound spend.',
    expectedClassification: 'Historical Genesis Vault',
    transactions: [
      {
        hash: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
        from_address: 'Coinbase Block Reward',
        to_address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        value_eth: 50.0,
        timestamp: 1231006505,
        block_number: 0,
        gas_price_gwei: 0,
        gas_used: 134,
        is_error: false,
        method: 'Genesis Block 50 BTC Mint'
      },
      {
        hash: 'f4184fc596403b9d638783cf57adfe4c75c605f6356fbc91338530e9831e9e16',
        from_address: '12cbQLTFMXRnSzktFkuoG3eHoMeFtpTu3S',
        to_address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        value_eth: 10.0,
        timestamp: 1231731000,
        block_number: 170,
        gas_price_gwei: 0,
        gas_used: 275,
        is_error: false,
        method: 'Early Tribute Transfer'
      }
    ]
  }
};

export function getDemoScenario(keyOrAddress: string): DemoScenario | undefined {
  if (DEMO_SCENARIOS[keyOrAddress]) {
    return DEMO_SCENARIOS[keyOrAddress];
  }
  return Object.values(DEMO_SCENARIOS).find(
    s => s.targetAddress.toLowerCase() === keyOrAddress.toLowerCase()
  );
}
