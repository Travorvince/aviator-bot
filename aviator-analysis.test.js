
const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateMetrics } = require('./analysis-metrics');

test('calculates all classification metrics correctly', () => {
    const metrics = calculateMetrics({
        truePositive: 80,
        trueNegative: 100,
        falsePositive: 20,
        falseNegative: 10
    });

    assert.equal(metrics.tested, 210);
    assert.ok(Math.abs(metrics.accuracy - 85.7143) < 0.01);
    assert.equal(metrics.precision, 80);
    assert.ok(Math.abs(metrics.recall - 88.8889) < 0.01);
    assert.ok(Math.abs(metrics.specificity - 83.3333) < 0.01);
    assert.ok(Math.abs(metrics.f1 - 84.2105) < 0.01);
});

test('returns zero metrics when there are no observations', () => {
    const metrics = calculateMetrics({
        truePositive: 0,
        trueNegative: 0,
        falsePositive: 0,
        falseNegative: 0
    });

    assert.equal(metrics.tested, 0);
    assert.equal(metrics.accuracy, 0);
    assert.equal(metrics.precision, 0);
    assert.equal(metrics.recall, 0);
    assert.equal(metrics.specificity, 0);
    assert.equal(metrics.f1, 0);
});

test('handles a classifier with no positive predictions', () => {
    const metrics = calculateMetrics({
        truePositive: 0,
        trueNegative: 50,
        falsePositive: 0,
        falseNegative: 30
    });

    assert.equal(metrics.precision, 0);
    assert.equal(metrics.recall, 0);
    assert.equal(metrics.specificity, 100);
    assert.equal(metrics.f1, 0);
});
