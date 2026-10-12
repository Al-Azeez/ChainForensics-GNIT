import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { Investigation, IInvestigation } from '../models/Investigation.js';
import { blockchainService, NormalizedTransaction } from '../services/blockchain.service.js';
import { bitcoinService } from '../services/bitcoin.service.js';
import { aiService } from '../services/ai.service.js';
import { getDemoScenario, DEMO_SCENARIOS } from '../services/demo.service.js';
import { AnalyzeRequestSchema, UpdateInvestigationSchema } from '../validators/investigation.validator.js';

// In-memory investigations store fallback when MongoDB is not connected
const memoryInvestigations: Map<string, any> = new Map();

function buildCytoscapeGraph(target: string, targetType: string, txs: NormalizedTransaction[], riskClassification: string) {
  const targetLower = target.toLowerCase();
  const nodesMap = new Map<string, any>();
  const edges: Array<any> = [];

  // Always add target node
  nodesMap.set(targetLower, {
    data: {
      id: targetLower,
      label: targetType === 'address' ? `${targetLower.slice(0, 6)}...${targetLower.slice(-4)}` : 'Target Tx',
      fullAddress: targetLower,
      type: targetType === 'address' ? 'target_wallet' : 'target_tx',
      isTarget: true,
      inflowEth: 0,
      outflowEth: 0,
      riskLevel: riskClassification
    }
  });

  for (let i = 0; i < txs.length; i++) {
    const tx = txs[i];
    const fromAddr = (tx.from_address || '').toLowerCase();
    const toAddr = (tx.to_address || '').toLowerCase();
    const val = tx.value_eth || 0;

    if (fromAddr && !nodesMap.has(fromAddr)) {
      nodesMap.set(fromAddr, {
        data: {
          id: fromAddr,
          label: `${fromAddr.slice(0, 6)}...${fromAddr.slice(-4)}`,
          fullAddress: fromAddr,
          type: 'counterparty',
          isTarget: fromAddr === targetLower,
          inflowEth: 0,
          outflowEth: 0
        }
      });
    }

    if (toAddr && !nodesMap.has(toAddr)) {
      nodesMap.set(toAddr, {
        data: {
          id: toAddr,
          label: `${toAddr.slice(0, 6)}...${toAddr.slice(-4)}`,
          fullAddress: toAddr,
          type: 'counterparty',
          isTarget: toAddr === targetLower,
          inflowEth: 0,
          outflowEth: 0
        }
      });
    }

    if (fromAddr && nodesMap.has(fromAddr)) {
      nodesMap.get(fromAddr).data.outflowEth = (nodesMap.get(fromAddr).data.outflowEth || 0) + val;
    }
    if (toAddr && nodesMap.has(toAddr)) {
      nodesMap.get(toAddr).data.inflowEth = (nodesMap.get(toAddr).data.inflowEth || 0) + val;
    }

    if (fromAddr && toAddr) {
      edges.push({
        data: {
          id: `edge_${tx.hash.slice(0, 10)}_${i}`,
          source: fromAddr,
          target: toAddr,
          valueEth: val,
          hash: tx.hash,
          timestamp: tx.timestamp,
          isError: tx.is_error
        }
      });
    }
  }

  return {
    nodes: Array.from(nodesMap.values()),
    edges
  };
}

export async function analyze(req: AuthRequest, res: Response) {
  try {
    const parseResult = AnalyzeRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { identifier, title, network, analysisScope, demoMode, demoScenarioId } = parseResult.data;
    const cleanId = identifier.trim();

    let targetType: 'address' | 'transaction';
    let transactions: NormalizedTransaction[] = [];
    let isSampleData = false;
    let dataSource = 'Ethereum JSON-RPC Provider';
    let dataCompleteness = 'AVAILABLE_HISTORY';

    // 1. Check if Demonstration Mode requested
    if (demoMode || demoScenarioId) {
      isSampleData = true;
      dataSource = 'ChainForensics Deterministic Benchmark Dataset (SAMPLE DATA)';
      const scenario = getDemoScenario(demoScenarioId || cleanId) || DEMO_SCENARIOS.layering_peeling;
      transactions = scenario.transactions;
      targetType = 'address';
    } else {
      // 2. Validate real identifier
      const isBitcoin = (network || '').toLowerCase().trim() === 'bitcoin';
      const valResult = blockchainService.validateIdentifier(cleanId, network);
      if (!valResult.isValid) {
        return res.status(400).json({ error: valResult.error });
      }
      targetType = valResult.type!;

      if (isBitcoin) {
        if (targetType === 'transaction') {
          try {
            const tx = await bitcoinService.getTransactionDetails(cleanId);
            transactions = [tx];
            dataCompleteness = 'SINGLE_TRANSACTION';
            dataSource = 'Bitcoin Esplora / Mempool.space (Targeted UTXO Lookup)';
          } catch (err: any) {
            return res.status(404).json({
              error: `Failed to retrieve Bitcoin transaction: ${err.message}. You may explore with Demonstration Mode.`,
              isRpcError: true
            });
          }
        } else {
          // Bitcoin address lookup
          try {
            const overview = await bitcoinService.getWalletOverview(cleanId);
            dataSource = `Bitcoin Network (UTXO State: ${overview.balanceEth} BTC, ${overview.transactionCount} txs)`;

            const sampleMatch = getDemoScenario(cleanId);
            if (sampleMatch) {
              transactions = sampleMatch.transactions;
              dataSource += ' [Matched Reference Dataset]';
            } else {
              // Retrieve real live on-chain UTXO transactions from Mempool/Blockstream
              try {
                const liveTxs = await bitcoinService.getRecentTransactions(cleanId);
                if (liveTxs.length > 0) {
                  transactions = liveTxs;
                  dataCompleteness = 'PARTIAL';
                  dataSource += ` [Live On-Chain UTXO Telemetry: ${liveTxs.length} records]`;
                } else {
                  transactions = [];
                  dataCompleteness = 'INSUFFICIENT';
                }
              } catch {
                transactions = [];
                dataCompleteness = 'INSUFFICIENT';
              }
            }
          } catch (err: any) {
            return res.status(502).json({
              error: `Bitcoin Network telemetry failed: ${err.message}. Please test with Demonstration Mode or verify connection.`,
              isRpcError: true
            });
          }
        }
      } else if (targetType === 'transaction') {
        try {
          const tx = await blockchainService.getTransactionDetails(cleanId, network);
          transactions = [tx];
          dataCompleteness = 'SINGLE_TRANSACTION';
          dataSource = `${network.toUpperCase()} JSON-RPC (Single Transaction Lookup)`;
        } catch (err: any) {
          return res.status(404).json({
            error: `Failed to retrieve transaction from ${network.toUpperCase()} blockchain: ${err.message}. You may explore with Demonstration Mode.`,
            isRpcError: true
          });
        }
      } else {
        // Address lookup
        try {
          const overview = await blockchainService.getWalletOverview(cleanId, network);
          dataSource = `${network.toUpperCase()} JSON-RPC (Wallet State: ${overview.transactionCount} nonce)`;
          
          // Check if this matches any known demo scenario or public testing address
          const sampleMatch = getDemoScenario(cleanId);
          if (sampleMatch) {
            transactions = sampleMatch.transactions;
            dataSource += ' [Matched Reference Dataset]';
          } else {
            // Note limitation of raw JSON-RPC for arbitrary wallet history
            transactions = [];
            dataCompleteness = 'INSUFFICIENT';
          }
        } catch (err: any) {
          return res.status(502).json({
            error: `Blockchain RPC connection failed: ${err.message}. Please configure ETHEREUM_RPC_URL or test with Demonstration Mode.`,
            isRpcError: true
          });
        }
      }
    }

    // 3. Execute AI Analysis Pipeline
    const aiResponse = await aiService.runAnalysis({
      target_identifier: cleanId,
      target_type: targetType,
      transactions,
      analysis_scope: analysisScope,
      network
    });

    // 4. Build summary metrics
    const timestamps = transactions.map(t => t.timestamp);
    const spanSec = timestamps.length > 1 ? Math.max(1, Math.max(...timestamps) - Math.min(...timestamps)) : 0;
    const timeSpanDays = parseFloat((spanSec / 86400).toFixed(2));

    const totalInflow = transactions
      .filter(t => (t.to_address || '').toLowerCase() === cleanId.toLowerCase())
      .reduce((sum, t) => sum + (t.value_eth || 0), 0);

    const totalOutflow = transactions
      .filter(t => (t.from_address || '').toLowerCase() === cleanId.toLowerCase())
      .reduce((sum, t) => sum + (t.value_eth || 0), 0);

    const counterparties = new Set<string>();
    transactions.forEach(t => {
      if (t.from_address) counterparties.add(t.from_address.toLowerCase());
      if (t.to_address) counterparties.add(t.to_address.toLowerCase());
    });
    counterparties.delete(cleanId.toLowerCase());

    const summary = {
      totalTx: transactions.length,
      inflowEth: parseFloat(totalInflow.toFixed(4)),
      outflowEth: parseFloat(totalOutflow.toFixed(4)),
      uniqueCounterparties: counterparties.size,
      timeSpanDays,
      failedTxCount: transactions.filter(t => t.is_error).length
    };

    // 5. Build Graph Representation for Cytoscape
    const graphData = buildCytoscapeGraph(cleanId, targetType, transactions, aiResponse.risk_assessment.risk_classification);

    const defaultTitle = isSampleData
      ? `[SAMPLE DATA] ${cleanId.slice(0, 8)}... Analysis`
      : `Investigation of ${cleanId.slice(0, 8)}... (${network})`;

    const investigationDoc = {
      userId: req.user?.id || 'anonymous_investigator',
      title: title || defaultTitle,
      network,
      inputType: targetType,
      inputIdentifier: cleanId,
      isSampleData,
      analysisTimestamp: new Date(),
      dataSource,
      dataCompleteness: aiResponse.data_completeness,
      transactionSummary: summary,
      featureSet: aiResponse.features,
      ruleFindings: aiResponse.rules,
      anomalyFindings: aiResponse.anomaly_detection,
      mlFindings: aiResponse.ml_prediction,
      riskAssessment: aiResponse.risk_assessment,
      rawTransactions: transactions,
      graphData,
      notes: isSampleData ? 'Deterministic forensic benchmark scenario.' : '',
      tags: isSampleData ? ['Sample Data', 'Demo'] : ['Forensic Analysis', network]
    };

    // 6. Persistence: Try MongoDB Atlas first if connected, fallback to memory
    let savedRecord: any = null;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        savedRecord = await Investigation.create(investigationDoc);
      } catch {
        // Fall back below
      }
    }

    if (!savedRecord) {
      const memId = 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      savedRecord = {
        _id: memId,
        id: memId,
        ...investigationDoc,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryInvestigations.set(memId, savedRecord);
    }

    return res.status(200).json({
      investigationId: savedRecord._id || savedRecord.id,
      investigation: savedRecord
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Investigation processing failed.' });
  }
}

export async function getAllInvestigations(req: AuthRequest, res: Response) {
  try {
    const { search, classification, limit = 50 } = req.query;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const query: any = {};
      if (search && typeof search === 'string') {
        query.$or = [
          { inputIdentifier: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } }
        ];
      }
      if (classification && typeof classification === 'string') {
        query['riskAssessment.risk_classification'] = classification;
      }

      try {
        const records = await Investigation.find(query)
          .sort({ analysisTimestamp: -1 })
          .limit(Number(limit));
        return res.json({ investigations: records, count: records.length });
      } catch {
        // Fall through to memory
      }
    }

    // Memory fallback
    let list = Array.from(memoryInvestigations.values());
    if (search && typeof search === 'string') {
      const s = search.toLowerCase();
      list = list.filter(r => (r.inputIdentifier || '').toLowerCase().includes(s) || (r.title || '').toLowerCase().includes(s));
    }
    if (classification && typeof classification === 'string') {
      list = list.filter(r => r.riskAssessment?.risk_classification === classification);
    }
    list.sort((a, b) => new Date(b.analysisTimestamp).getTime() - new Date(a.analysisTimestamp).getTime());
    return res.json({ investigations: list.slice(0, Number(limit)), count: list.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to retrieve investigation history.' });
  }
}

export async function getInvestigationById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        const record = await Investigation.findById(id);
        if (record) return res.json({ investigation: record });
      } catch {
        // Continue to memory check
      }
    }

    const mem = memoryInvestigations.get(id);
    if (mem) return res.json({ investigation: mem });

    return res.status(404).json({ error: 'Investigation record not found.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch investigation.' });
  }
}

export async function updateInvestigation(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const parseResult = UpdateInvestigationSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const updateData = parseResult.data;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        const updated = await Investigation.findByIdAndUpdate(id, updateData, { new: true });
        if (updated) return res.json({ investigation: updated });
      } catch {
        // Continue to memory
      }
    }

    const mem = memoryInvestigations.get(id);
    if (mem) {
      if (updateData.title) mem.title = updateData.title;
      if (updateData.notes !== undefined) mem.notes = updateData.notes;
      if (updateData.tags) mem.tags = updateData.tags;
      mem.updatedAt = new Date();
      return res.json({ investigation: mem });
    }

    return res.status(404).json({ error: 'Investigation record not found.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update investigation.' });
  }
}

export async function deleteInvestigation(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      try {
        const deleted = await Investigation.findByIdAndDelete(id);
        if (deleted) return res.json({ message: 'Investigation deleted successfully.' });
      } catch {
        // Continue to memory
      }
    }

    if (memoryInvestigations.has(id)) {
      memoryInvestigations.delete(id);
      return res.json({ message: 'Investigation deleted successfully.' });
    }

    return res.status(404).json({ error: 'Investigation record not found.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete investigation.' });
  }
}

export async function getDemoScenariosList(req: AuthRequest, res: Response) {
  return res.json({
    scenarios: Object.values(DEMO_SCENARIOS).map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      targetAddress: s.targetAddress,
      description: s.description,
      expectedClassification: s.expectedClassification,
      transactionCount: s.transactions.length
    }))
  });
}
