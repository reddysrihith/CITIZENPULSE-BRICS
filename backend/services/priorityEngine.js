/**
 * Explainable Priority Scoring Engine for CitizenPulse BRICS
 *
 * Scoring Formula (Total 100 points):
 * - 30% Citizen Demand (based on request density & volume)
 * - 25% Infrastructure Gap (percentage of infrastructure deficit)
 * - 20% Population Impact (affected population size scale)
 * - 15% Urgency Level (Critical=15, High=12, Medium=8, Low=4)
 * - 10% Investment Gap (High=10, Medium=7, Low=4)
 */

function calculatePriorityScore(data) {
  const {
    citizenRequests = 500,
    infrastructureGap = 30, // 0 - 100%
    affectedPopulation = 50000,
    urgency = 'High',
    investmentGap = 'Medium'
  } = data;

  // 1. Citizen Demand Score (Max 30)
  // 0 - 3000 requests scaled to 0-30 points
  const demandScore = Math.min(30, Math.round((citizenRequests / 3000) * 30));

  // 2. Infrastructure Gap Score (Max 25)
  const gapScore = Math.min(25, Math.round((infrastructureGap / 100) * 25));

  // 3. Population Impact Score (Max 20)
  // 0 - 500,000 population scaled to 0-20 points
  const popScore = Math.min(20, Math.round((Math.log10(Math.max(affectedPopulation, 100)) / 6) * 20));

  // 4. Urgency Score (Max 15)
  let urgencyScore = 8;
  if (urgency.toLowerCase() === 'critical') urgencyScore = 15;
  else if (urgency.toLowerCase() === 'high') urgencyScore = 12;
  else if (urgency.toLowerCase() === 'medium') urgencyScore = 8;
  else if (urgency.toLowerCase() === 'low') urgencyScore = 4;

  // 5. Investment Gap Score (Max 10)
  let invScore = 7;
  if (typeof investmentGap === 'string') {
    if (investmentGap.toLowerCase() === 'high') invScore = 10;
    else if (investmentGap.toLowerCase() === 'medium') invScore = 7;
    else invScore = 4;
  }

  const totalScore = Math.min(100, demandScore + gapScore + popScore + urgencyScore + invScore);

  return {
    totalScore,
    breakdown: {
      demandScore,
      gapScore,
      popScore,
      urgencyScore,
      invScore
    },
    formula: "30% Demand + 25% Infra Gap + 20% Population + 15% Urgency + 10% Investment Gap",
    explanation: `Region prioritised with ${totalScore}/100. Key drivers: ${gapScore}/25 Infrastructure Gap deficit and ${demandScore}/30 Citizen Signal Density.`
  };
}

module.exports = { calculatePriorityScore };
