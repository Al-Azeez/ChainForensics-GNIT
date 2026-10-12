import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { blockchainService } from '../src/services/blockchain.service.js';

describe('ChainForensics Backend API Tests', () => {
  it('GET /api/health returns system status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('services');
    expect(res.body.services).toHaveProperty('backend');
    expect(res.body.services).toHaveProperty('database');
  });

  it('Validates valid vs invalid Ethereum addresses and tx hashes', () => {
    const validAddr = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    const validTx = '0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060';
    const invalidInput = 'not_a_valid_eth_hash_or_address';

    expect(blockchainService.validateIdentifier(validAddr)).toEqual({
      isValid: true,
      type: 'address'
    });

    expect(blockchainService.validateIdentifier(validTx)).toEqual({
      isValid: true,
      type: 'transaction'
    });

    expect(blockchainService.validateIdentifier(invalidInput).isValid).toBe(false);
  });

  it('GET /api/investigations/demo-scenarios returns benchmark cases', async () => {
    const res = await request(app).get('/api/investigations/demo-scenarios');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('scenarios');
    expect(Array.isArray(res.body.scenarios)).toBe(true);
    expect(res.body.scenarios.length).toBeGreaterThan(0);
    expect(res.body.scenarios[0]).toHaveProperty('id');
    expect(res.body.scenarios[0]).toHaveProperty('targetAddress');
  });

  it('POST /api/auth/register and /api/auth/login workflow', async () => {
    const testEmail = `test_investigator_${Date.now()}@chainforensics.test`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'securePassword123!',
        name: 'Forensics Specialist'
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body).toHaveProperty('token');
    expect(regRes.body.user.email).toBe(testEmail);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'securePassword123!'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
  });

  it('POST /api/auth/demo-login generates demo investigator token', async () => {
    const res = await request(app).post('/api/auth/demo-login');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('demo_user');
  });

  it('Validates Bitcoin addresses and tx hashes', () => {
    const btcLegacy = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
    const btcP2SH = '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo';
    const btcSegwit = 'bc1qc53gxysfrynjh5cmlpatwak3zlq9qczvl0m709';
    const btcTx = '9e4f03529d9da12cf0dc619fb4ffd4c1850b813a33e0fed7074188eb33688b16';
    const invalid = 'not_a_btc_identifier';

    expect(blockchainService.validateIdentifier(btcLegacy, 'bitcoin')).toEqual({ isValid: true, type: 'address' });
    expect(blockchainService.validateIdentifier(btcP2SH, 'bitcoin')).toEqual({ isValid: true, type: 'address' });
    expect(blockchainService.validateIdentifier(btcSegwit, 'bitcoin')).toEqual({ isValid: true, type: 'address' });
    expect(blockchainService.validateIdentifier(btcTx, 'bitcoin')).toEqual({ isValid: true, type: 'transaction' });
    expect(blockchainService.validateIdentifier(invalid, 'bitcoin').isValid).toBe(false);
  });

  it('POST /api/investigations/analyze executes Bitcoin analysis', async () => {
    const loginRes = await request(app).post('/api/auth/demo-login');
    const token = loginRes.body.token;

    const res = await request(app)
      .post('/api/investigations/analyze')
      .set('Authorization', `Bearer ${token}`)
      .send({
        identifier: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo',
        network: 'bitcoin',
        analysisScope: 'standard',
        title: 'Audit: Binance Cold Storage (BTC)'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('investigation');
    expect(res.body.investigation.network).toBe('bitcoin');
    expect(res.body.investigation).toHaveProperty('riskAssessment');
    expect(res.body.investigation).toHaveProperty('graphData');
  }, 15000);
});
