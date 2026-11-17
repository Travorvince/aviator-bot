function calculateMetrics({
    truePositive,
    trueNegative,
    falsePositive,
    falseNegative
}) {
    const tested = truePositive + trueNegative +
        falsePositive + falseNegative;

    const accuracy = tested > 0
        ? (truePositive + trueNegative) / tested * 100
        : 0;

    const precision = (truePositive + falsePositive) > 0
        ? truePositive / (truePositive + falsePositive) * 100
        : 0;

    const recall = (truePositive + falseNegative) > 0
        ? truePositive / (truePositive + falseNegative) * 100
        : 0;

    const specificity = (trueNegative + falsePositive) > 0
        ? trueNegative / (trueNegative + falsePositive) * 100
        : 0;

    const f1 = (precision + recall) > 0
        ? 2 * precision * recall / (precision + recall)
        : 0;

    return {
        tested,
        accuracy,
        precision,
        recall,
        specificity,
        f1
    };
}

module.exports = { calculateMetrics };