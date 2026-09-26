const axios = require('axios');
const User = require('../models/User');

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

/**
 * Get embeddings from HuggingFace with exponential backoff retry.
 */
const getEmbedding = async (text, retries = 3) => {
  if (!text || text.trim() === '') return [];
  if (!HUGGINGFACE_API_KEY) {
    console.warn('HuggingFace API key is missing; falling back to local skill similarity.');
    return null;
  }
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🤖 Embedding request for text (len ${text.length})... Attempt ${i + 1}`);
      const response = await axios.post(
        MODEL_URL,
        { inputs: [text] },
        {
          headers: {
            Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data[0]; // array of floats
    } catch (error) {
      if (error.response && error.response.status === 503) {
        // Model is loading, wait and retry
        const estimatedTime = error.response.data.estimated_time || 20;
        console.warn(`⏳ Model is loading. Retrying in ${estimatedTime}s...`);
        await new Promise(res => setTimeout(res, estimatedTime * 1000));
      } else {
        const backoff = Math.pow(2, i) * 1000;
        console.warn(`⚠️ HF API failed: ${error.message}. Retrying in ${backoff}ms...`);
        if (i === retries - 1) {
          console.error('❌ HF API exhausted retries.');
          return null; // fallback to null
        }
        await new Promise(res => setTimeout(res, backoff));
      }
    }
  }
  return null;
};

/**
 * Calculate Cosine Similarity between two vectors
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Fallback: Jaccard Similarity for skill arrays
 */
const jaccardSimilarity = (arrA, arrB) => {
  if (!arrA || !arrB || arrA.length === 0 || arrB.length === 0) return 0;
  const setA = new Set(arrA.map(a => a.toLowerCase().trim()));
  const setB = new Set(arrB.map(b => b.toLowerCase().trim()));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
};

/**
 * Compile freelancer profile text for embedding
 */
const getFreelancerText = (freelancer) => {
  const skills = freelancer.skills ? freelancer.skills.map(s => s.name).join(', ') : '';
  const bio = freelancer.bio || '';
  return `Skills: ${skills}. Bio: ${bio}`;
};

/**
 * Update freelancer embedding in DB
 */
const updateFreelancerEmbedding = async (freelancerId) => {
  try {
    const freelancer = await User.findById(freelancerId);
    if (!freelancer || freelancer.role !== 'freelancer') return null;

    const text = getFreelancerText(freelancer);
    const embedding = await getEmbedding(text);
    if (embedding) {
      freelancer.skillEmbedding = embedding;
      await freelancer.save();
      console.log(`✅ Updated embedding for freelancer ${freelancer.email}`);
    }
    return freelancer;
  } catch (error) {
    console.error('Error updating freelancer embedding:', error);
    return null;
  }
};

/**
 * Compute the match score for a job and a list of freelancers
 */
const computeMatches = async (job, freelancers) => {
  const jobText = `Job Title: ${job.title}. Required Skills: ${job.requiredSkills ? job.requiredSkills.join(', ') : (job.skills ? job.skills.join(', ') : '')}. Description: ${job.description}`;
  const jobEmbedding = await getEmbedding(jobText);

  const jobSkills = job.requiredSkills && job.requiredSkills.length > 0 ? job.requiredSkills : (job.skills || []);

  const results = [];

  for (const f of freelancers) {
    let skillSimilarity = 0;

    if (jobEmbedding && f.skillEmbedding && f.skillEmbedding.length > 0) {
      skillSimilarity = cosineSimilarity(jobEmbedding, f.skillEmbedding);
    } else {
      // Graceful degradation to Jaccard Similarity
      const fSkills = f.skills ? f.skills.map(s => s.name) : [];
      skillSimilarity = jaccardSimilarity(jobSkills, fSkills);
    }

    // Normalize values to 0-1 range
    skillSimilarity = Math.max(0, Math.min(1, skillSimilarity));

    // normalizedRating
    const normalizedRating = (f.averageRating || 0) / 5;

    // locationBonus
    let locationBonus = 0.0;
    if (job.location && f.location) {
      const jobCity = job.location.city ? job.location.city.toLowerCase() : null;
      const jobCountry = job.location.country ? job.location.country.toLowerCase() : null;
      const fCity = f.location.city ? f.location.city.toLowerCase() : null;
      const fCountry = f.location.country ? f.location.country.toLowerCase() : null;

      if (jobCity && fCity && jobCity === fCity) {
        locationBonus = 1.0;
      } else if (jobCountry && fCountry && jobCountry === fCountry) {
        locationBonus = 0.5;
      }
    }

    // compositeScore
    const compositeScore = (skillSimilarity * 0.60) + (normalizedRating * 0.25) + (locationBonus * 0.15);

    results.push({
      freelancerId: f._id,
      name: f.name,
      avatar: f.profileImage || '',
      skills: f.skills ? f.skills.map(s => s.name) : [],
      averageRating: f.averageRating || 0,
      location: f.location || {},
      compositeScore,
      skillSimilarity,
      ratingScore: normalizedRating,
      locationBonus,
    });
  }

  // Sort descending
  results.sort((a, b) => b.compositeScore - a.compositeScore);

  // Mark top match
  if (results.length > 0) {
    results[0].isTopMatch = true;
    for (let i = 1; i < results.length; i++) {
      results[i].isTopMatch = false;
    }
  }

  return results.slice(0, 10);
};

module.exports = {
  getEmbedding,
  updateFreelancerEmbedding,
  computeMatches
};
