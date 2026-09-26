const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const { analyzeCitizenRequest, generatePolicyBrief } = require('../services/aiService');
const { calculatePriorityScore } = require('../services/priorityEngine');

// Load Data
const requestsPath = path.join(__dirname, '../data/citizen_requests.json');
const regionsPath = path.join(__dirname, '../data/regions.json');
const infraPath = path.join(__dirname, '../data/infrastructure.json');
const recsPath = path.join(__dirname, '../data/recommendations.json');

function loadJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading ${filePath}:`, err.message);
    return [];
  }
}

function saveJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error saving ${filePath}:`, err.message);
  }
}

// GET /api/health
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiEngine: process.env.GEMINI_API_KEY ? 'Gemini 1.5 Flash' : 'DEMO MODE (Deterministic AI Fallback)',
    demoMode: !process.env.GEMINI_API_KEY,
    database: 'SQLite / JSON Store',
    version: '1.0.0-brics-hackathon'
  });
});

// GET /api/dashboard
router.get('/dashboard', (req, res) => {
  const requests = loadJSON(requestsPath);
  const regions = loadJSON(regionsPath);
  const infra = loadJSON(infraPath);

  const totalRequests = 24681; // Synthetic nationwide total
  const highPriority = 4286;
  const demandHotspots = 37;
  const infrastructureGaps = 82;
  const investmentGaps = 21;
  const projectedImpact = '8.4M';

  res.json({
    kpis: {
      totalRequests,
      highPriority,
      demandHotspots,
      infrastructureGaps,
      investmentGaps,
      projectedImpact
    },
    requestsTimeline: [
      { month: 'Apr', requests: 3100, resolved: 2400 },
      { month: 'May', requests: 3800, resolved: 2900 },
      { month: 'Jun', requests: 4200, resolved: 3100 },
      { month: 'Jul', requests: 4900, resolved: 3700 },
      { month: 'Aug', requests: 5600, resolved: 4100 },
      { month: 'Sep', requests: 6481, resolved: 4800 }
    ],
    categoryBreakdown: [
      { name: 'Water & Sanitation', count: 7420, fill: '#22D3EE' },
      { name: 'Roads & Transport', count: 5210, fill: '#8B5CF6' },
      { name: 'Healthcare', count: 3840, fill: '#3B82F6' },
      { name: 'Education', count: 2950, fill: '#10B981' },
      { name: 'Electricity', count: 2310, fill: '#F59E0B' },
      { name: 'Digital Connectivity', count: 1840, fill: '#EC4899' },
      { name: 'Housing', count: 1111, fill: '#6366F1' }
    ],
    urgencyDistribution: [
      { name: 'Critical', value: 18, color: '#EF4444' },
      { name: 'High', value: 42, color: '#F59E0B' },
      { name: 'Medium', value: 28, color: '#3B82F6' },
      { name: 'Low', value: 12, color: '#10B981' }
    ],
    regions,
    infrastructureSummary: infra
  });
});

// GET /api/requests
router.get('/requests', (req, res) => {
  const requests = loadJSON(requestsPath);
  const { category, region, country, search } = req.query;

  let filtered = requests;
  if (category) filtered = filtered.filter(r => r.category.toLowerCase() === category.toLowerCase());
  if (region) filtered = filtered.filter(r => r.region.toLowerCase() === region.toLowerCase());
  if (country) filtered = filtered.filter(r => r.country.toLowerCase() === country.toLowerCase());
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(r => 
      r.rawText.toLowerCase().includes(q) ||
      r.translation.toLowerCase().includes(q) ||
      r.subcategory.toLowerCase().includes(q)
    );
  }

  res.json({
    total: filtered.length,
    requests: filtered
  });
});

// GET /api/requests/:id
router.get('/requests/:id', (req, res) => {
  const requests = loadJSON(requestsPath);
  const item = requests.find(r => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Request not found' });
  res.json(item);
});

// POST /api/requests
router.post('/requests', async (req, res) => {
  const requests = loadJSON(requestsPath);
  const { rawText, language, channel } = req.body;

  if (!rawText) return res.status(400).json({ error: 'rawText is required' });

  const aiAnalysis = await analyzeCitizenRequest(rawText, language, channel);

  const newRequest = {
    id: `REQ-${Date.now().toString().slice(-4)}`,
    language: aiAnalysis.language,
    rawText,
    translation: aiAnalysis.translation,
    category: aiAnalysis.category,
    subcategory: aiAnalysis.subcategory,
    region: aiAnalysis.location,
    country: aiAnalysis.country || 'India',
    lat: 17.8744 + (Math.random() - 0.5) * 2,
    lng: 78.1008 + (Math.random() - 0.5) * 2,
    urgency: aiAnalysis.urgency,
    affectedPopulation: aiAnalysis.affectedPopulation,
    sentiment: aiAnalysis.sentiment,
    infrastructureNeed: aiAnalysis.infrastructureNeed,
    confidence: aiAnalysis.confidence,
    timestamp: new Date().toISOString(),
    status: 'Verified',
    channel: channel || 'Web Input'
  };

  requests.unshift(newRequest);
  saveJSON(requestsPath, requests);

  res.json({
    success: true,
    request: newRequest,
    analysis: aiAnalysis
  });
});

// POST /api/analyze
router.post('/analyze', async (req, res) => {
  const { rawText, language, channel } = req.body;
  if (!rawText) return res.status(400).json({ error: 'rawText is required' });

  const analysis = await analyzeCitizenRequest(rawText, language, channel);
  
  // Calculate priority score for extracted parameters
  const priority = calculatePriorityScore({
    citizenRequests: 1284,
    infrastructureGap: 32,
    affectedPopulation: analysis.affectedPopulation,
    urgency: analysis.urgency,
    investmentGap: 'Medium'
  });

  res.json({
    ...analysis,
    priorityScore: priority.totalScore,
    priorityBreakdown: priority.breakdown,
    priorityExplanation: priority.explanation
  });
});

// GET /api/hotspots
router.get('/hotspots', (req, res) => {
  const regions = loadJSON(regionsPath);
  const hotspots = regions.map((reg, idx) => ({
    hotspotId: `HOTSPOT-#${String(idx + 1).padStart(2, '0')}`,
    ...reg
  }));
  res.json(hotspots);
});

// GET /api/infrastructure
router.get('/infrastructure', (req, res) => {
  const infra = loadJSON(infraPath);
  res.json(infra);
});

// GET /api/recommendations
router.get('/recommendations', (req, res) => {
  const recs = loadJSON(recsPath);
  res.json(recs);
});

// POST /api/policy-brief
router.post('/policy-brief', async (req, res) => {
  const { region = 'Telangana', category = 'Water & Sanitation', period = 'Q3 2026' } = req.body;
  const brief = await generatePolicyBrief(region, category, period);
  res.json(brief);
});

// POST /api/impact
router.post('/impact', (req, res) => {
  const { budget = 150, populationCoverage = 85, implementationPeriod = 12, interventionType = 'Water Treatment & Grid Upgrade' } = req.body;

  // Calculate dynamic impact metrics based on sliders
  const baselineComplaints = 1284;
  const complaintReductionPct = Math.min(75, Math.round((budget / 200) * 45 + (populationCoverage / 100) * 30));
  const newComplaints = Math.max(120, Math.round(baselineComplaints * (1 - complaintReductionPct / 100)));

  const baselineAccess = 68;
  const newAccess = Math.min(98, Math.round(baselineAccess + (populationCoverage / 100) * 26));

  const baselineGap = 32;
  const newGap = Math.max(3, Math.round(100 - newAccess));

  const projectedBeneficiaries = Math.round(184000 * (populationCoverage / 85));
  const estimatedImprovementPct = Math.round(complaintReductionPct * 0.7);

  res.json({
    inputs: { budget, populationCoverage, implementationPeriod, interventionType },
    beforeAfter: {
      citizenComplaints: { before: baselineComplaints, after: newComplaints },
      populationAccessPct: { before: baselineAccess, after: newAccess },
      infrastructureGapPct: { before: baselineGap, after: newGap },
      projectedBeneficiaries,
      estimatedImprovementPct
    },
    timelineProjection: [
      { month: 'M0', complaints: baselineComplaints, access: baselineAccess },
      { month: `M${Math.round(implementationPeriod * 0.25)}`, complaints: Math.round(baselineComplaints * 0.85), access: Math.round(baselineAccess + 5) },
      { month: `M${Math.round(implementationPeriod * 0.5)}`, complaints: Math.round(baselineComplaints * 0.60), access: Math.round(baselineAccess + 12) },
      { month: `M${Math.round(implementationPeriod * 0.75)}`, complaints: Math.round(baselineComplaints * 0.40), access: Math.round(baselineAccess + 18) },
      { month: `M${implementationPeriod}`, complaints: newComplaints, access: newAccess }
    ],
    disclaimer: 'Simulated / Estimated Impact — Derived from CitizenPulse DPI Synthetic Model'
  });
});

// GET /api/regions
router.get('/regions', (req, res) => {
  const regions = loadJSON(regionsPath);
  res.json(regions);
});

// GET /api/investments
router.get('/investments', (req, res) => {
  res.json([
    { region: 'Telangana', allocated: '₹420 Cr', required: '₹565 Cr', gap: '₹145 Cr', category: 'Water & Sanitation' },
    { region: 'Maharashtra', allocated: '₹850 Cr', required: '₹1,130 Cr', gap: '₹280 Cr', category: 'Roads & Transport' },
    { region: 'Bahia', allocated: '$42M', required: '$60.5M', gap: '$18.5M', category: 'Healthcare' },
    { region: 'Sverdlovsk', allocated: '₽2.8B', required: '₽4.0B', gap: '₽1.2B', category: 'Electricity' },
    { region: 'Henan', allocated: '¥120M', required: '¥145M', gap: '¥25M', category: 'Digital Connectivity' },
    { region: 'Eastern Cape', allocated: 'R 620M', required: 'R 930M', gap: 'R 310M', category: 'Water & Sanitation' }
  ]);
});

module.exports = router;
