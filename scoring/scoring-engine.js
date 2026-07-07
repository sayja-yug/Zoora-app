export const CATEGORY_WEIGHTS = {
    market: 0.28,
    tech: 0.22,
    team: 0.15,
    future: 0.15,
    certs: 0.10,
    risk: 0.10,
};
export function computeScores(metricValues, allMetrics) {
    const categories = Object.keys(CATEGORY_WEIGHTS);
    const totalMetricsPerCategory = {
        tech: 0, certs: 0, market: 0, future: 0, team: 0, risk: 0,
    };
    for (const m of allMetrics) {
        if (m.category in totalMetricsPerCategory) {
            totalMetricsPerCategory[m.category]++;
        }
    }
    const byCategory = {
        tech: [], certs: [], market: [], future: [], team: [], risk: [],
    };
    for (const mv of metricValues) {
        if (mv.category in byCategory) {
            byCategory[mv.category].push(mv);
        }
    }
    const categoryScores = {};
    for (const cat of categories) {
        const populated = byCategory[cat];
        const total = totalMetricsPerCategory[cat];
        if (populated.length === 0) {
            categoryScores[cat] = {
                category: cat,
                raw_score: 0,
                weighted_score: 0,
                populated_metrics: 0,
                total_metrics: total,
                confidence_breakdown: { verified_doc: 0, llm_inferred: 0, self_reported: 0 },
            };
            continue;
        }
        const totalPopulatedWeight = populated.reduce((sum, mv) => sum + mv.weight, 0);
        const weightedScoreSum = populated.reduce((sum, mv) => sum + mv.weight * mv.score, 0);
        const weightedScore = totalPopulatedWeight > 0
            ? weightedScoreSum / totalPopulatedWeight
            : 0;
        const rawScore = populated.reduce((sum, mv) => sum + mv.score, 0) / populated.length;
        const confidenceWeights = {
            verified_doc: 0, llm_inferred: 0, self_reported: 0,
        };
        for (const mv of populated) {
            confidenceWeights[mv.confidence_tag] += mv.weight;
        }
        const breakdown = {
            verified_doc: totalPopulatedWeight > 0 ? round2(confidenceWeights.verified_doc / totalPopulatedWeight) : 0,
            llm_inferred: totalPopulatedWeight > 0 ? round2(confidenceWeights.llm_inferred / totalPopulatedWeight) : 0,
            self_reported: totalPopulatedWeight > 0 ? round2(confidenceWeights.self_reported / totalPopulatedWeight) : 0,
        };
        categoryScores[cat] = {
            category: cat,
            raw_score: round2(rawScore),
            weighted_score: round2(clamp(weightedScore, 0, 10)),
            populated_metrics: populated.length,
            total_metrics: total,
            confidence_breakdown: breakdown,
        };
    }
    let totalScore = 0;
    for (const cat of categories) {
        totalScore += CATEGORY_WEIGHTS[cat] * categoryScores[cat].weighted_score;
    }
    const totalMetrics = allMetrics.length;
    const profileCompleteness = totalMetrics > 0
        ? round2((metricValues.length / totalMetrics) * 100)
        : 0;
    return {
        categories: categoryScores,
        total_weighted_score: round2(clamp(totalScore, 0, 10)),
        profile_completeness_pct: clamp(profileCompleteness, 0, 100),
    };
}
function round2(n) {
    return Math.round(n * 100) / 100;
}
function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}
export default computeScores;
