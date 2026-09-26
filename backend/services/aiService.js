const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey.trim() !== '') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('[AI Service] Gemini API client initialized.');
  } catch (err) {
    console.warn('[AI Service] Failed to initialize Gemini client:', err.message);
  }
}

/**
 * Fallback DEMO MODE deterministic responses for fast hackathon presentation.
 */
function getDemoAnalysisResponse(rawText, userLang) {
  const text = (rawText || '').toLowerCase();
  
  let language = userLang || 'Telugu';
  let translation = rawText;
  let category = 'Water & Sanitation';
  let subcategory = 'Drinking Water Grid';
  let location = 'Telangana';
  let country = 'India';
  let urgency = 'High';
  let affectedPopulation = 8400;
  let confidence = 0.94;
  let infrastructureNeed = 'Piped Water Grid & Micro-Filtration Units';

  if (text.includes('మా గ్రామంలో') || text.includes('నీరు') || text.includes('water') || userLang === 'Telugu') {
    language = 'Telugu';
    translation = "Our village has had a drinking water problem for the past two years. The situation becomes even more severe in summer. Water is not coming in the pipes.";
    category = 'Water & Sanitation';
    subcategory = 'Drinking Water Supply';
    location = 'Telangana';
    country = 'India';
    urgency = 'High';
    affectedPopulation = 8400;
    confidence = 0.94;
    infrastructureNeed = 'Community Water Treatment & Pipeline Extension';
  } else if (text.includes('डॉक्टर') || text.includes('स्वास्थ्य') || text.includes('मरीजों') || userLang === 'Hindi') {
    language = 'Hindi';
    translation = "Doctors do not come regularly to our block primary health center and essential medicines are not available. Patients have to travel 40 km to the city.";
    category = 'Healthcare';
    subcategory = 'Primary Health Centers';
    location = 'Uttar Pradesh';
    country = 'India';
    urgency = 'High';
    affectedPopulation = 14200;
    confidence = 0.92;
    infrastructureNeed = 'PHC Upgradation & Telemedicine Network';
  } else if (text.includes('estrada') || text.includes('buracos') || userLang === 'Portuguese') {
    language = 'Portuguese';
    translation = "The rural road between Feira de Santana and the neighboring district is full of potholes and becomes impassable during the rainy season.";
    category = 'Roads & Transport';
    subcategory = 'Rural Road Infrastructure';
    location = 'Bahia';
    country = 'Brazil';
    urgency = 'High';
    affectedPopulation = 19500;
    confidence = 0.95;
    infrastructureNeed = 'All-Weather Paved Corridor';
  } else if (text.includes('отопление') || text.includes('зимой') || userLang === 'Russian') {
    language = 'Russian';
    translation = "In our village, central heating is regularly cut off in winter. The old boiler house cannot cope with severe frosts.";
    category = 'Electricity';
    subcategory = 'Thermal Heating Grid';
    location = 'Sverdlovsk Oblast';
    country = 'Russia';
    urgency = 'High';
    affectedPopulation = 6200;
    confidence = 0.91;
    infrastructureNeed = 'Automated Boiler & Insulation Renewal';
  } else if (text.includes('5g') || text.includes('信号') || userLang === 'Chinese') {
    language = 'Chinese';
    translation = "Agricultural products in mountainous areas cannot be sold online in a timely manner through 5G network; network signal is very weak.";
    category = 'Digital Connectivity';
    subcategory = 'Rural 5G & Internet';
    location = 'Henan Province';
    country = 'China';
    urgency = 'Medium';
    affectedPopulation = 11000;
    confidence = 0.93;
    infrastructureNeed = 'Cellular Towers & Fiber Backbone';
  }

  return {
    isDemoMode: !genAI,
    language,
    translation,
    category,
    subcategory,
    location,
    country,
    urgency,
    affectedPopulation,
    confidence,
    infrastructureNeed,
    sentiment: 0.86,
    extractedKeywords: [category, location, subcategory, urgency]
  };
}

async function analyzeCitizenRequest(rawText, userLang, channel = 'Text') {
  if (!genAI) {
    return getDemoAnalysisResponse(rawText, userLang);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are CitizenPulse BRICS AI, an expert GovTech classifier.
Analyze this citizen input and output ONLY a valid JSON object without markdown formatting:

Input Text: "${rawText}"
User Specified Language: "${userLang || 'Auto-detect'}"

Expected JSON format:
{
  "language": "Detected language string",
  "translation": "English translation string",
  "category": "One of [Water & Sanitation, Roads & Transport, Healthcare, Education, Electricity, Digital Connectivity, Housing, Public Safety]",
  "subcategory": "Specific subcategory string",
  "location": "Region or province name in BRICS countries",
  "country": "India / Brazil / Russia / China / South Africa",
  "urgency": "Critical / High / Medium / Low",
  "affectedPopulation": number,
  "confidence": number between 0.8 and 0.99,
  "infrastructureNeed": "Brief statement of required civil intervention",
  "sentiment": number between 0 and 1
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    parsed.isDemoMode = false;
    return parsed;
  } catch (err) {
    console.warn('[AI Service] Gemini request error, falling back to Demo Mode:', err.message);
    return getDemoAnalysisResponse(rawText, userLang);
  }
}

async function generatePolicyBrief(region, category, period = 'Q3 2026') {
  const defaultBrief = {
    isDemoMode: !genAI,
    title: `POLICY BRIEF: Accelerating ${category} Resilience in ${region}`,
    region,
    category,
    period,
    executiveSummary: `This policy brief translates 1,280+ multilingual citizen feedback signals from ${region} into evidence-based infrastructure investment priorities. The data indicates an acute ${category} deficit impacting 184,000 residents across rural mandals. Immediate capital allocation of ₹145 Cr is recommended to address critical service disruptions before the peak demand cycle.`,
    keyEvidence: [
      `1,284 verified citizen complaints recorded across SMS, voice calls, and local portals over the past 90 days.`,
      `Infrastructure coverage stands at 68%, creating a 32% deficit compared to national DPI targets.`,
      `84% of affected households report daily economic productivity loss due to service outages.`
    ],
    citizenDemandSummary: `Citizen voices exhibit high emotional urgency (sentiment urgency score 0.86), with primary complaints focusing on non-functional supply lines and unaddressed maintenance backlogs.`,
    infrastructureGapAnalysis: `Current municipal infrastructure is operating at 118% design capacity. Pipelines and pump stations require modular solar-powered upgrades to eliminate single-point failure nodes.`,
    investmentContext: `The current public spending allocation for ${category} in ${region} is ₹420 Cr, leaving an unaddressed capital expenditure gap of ₹145 Cr.`,
    recommendedIntervention: `Deploy the 'Regional ${category} Upgrade Program': installing 18 community water treatment/infrastructure units, rehabilitating main distribution grids, and integrating smart IoT telemetry.`,
    expectedImpact: [
      `184,000 residents provided with uninterrupted daily access.`,
      `34% reduction in citizen distress signals within 90 days.`,
      `Infra coverage increased from 68% to 92%.`
    ],
    implementationConsiderations: `Requires joint execution by State Public Works and District Water Boards, utilizing modular pre-fabricated units for 6-month rapid commissioning.`,
    dataAssumptions: `Data consolidated from CitizenPulse synthetic DPI intelligence registry. All spatial projections subject to local environmental clearance.`
  };

  if (!genAI) return defaultBrief;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Generate an official government Executive Policy Brief JSON for region "${region}" and category "${category}" during period "${period}".
Return ONLY JSON without markdown:
{
  "title": "string",
  "region": "${region}",
  "category": "${category}",
  "period": "${period}",
  "executiveSummary": "string",
  "keyEvidence": ["string", "string", "string"],
  "citizenDemandSummary": "string",
  "infrastructureGapAnalysis": "string",
  "investmentContext": "string",
  "recommendedIntervention": "string",
  "expectedImpact": ["string", "string", "string"],
  "implementationConsiderations": "string",
  "dataAssumptions": "string"
}`;

    const result = await model.generateContent(prompt);
    const cleanJson = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    parsed.isDemoMode = false;
    return parsed;
  } catch (err) {
    return defaultBrief;
  }
}

module.exports = {
  analyzeCitizenRequest,
  generatePolicyBrief
};
