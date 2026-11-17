
const { loadResults } = require('./analysis-data');
const { calculateMetrics } = require('./analysis-metrics');

const TARGET = 2.00;
const INITIAL_HISTORY = 10;
const WINDOW = 5;

// Load historical results from CSV
const records = loadResults('aviator-results.csv');
const results = records.map(record => record.multiplier);

if (results.length <= INITIAL_HISTORY) {
    throw new Error('Not enough historical results.');
}

// Define a successful result
const success = value => value >= TARGET;

// Historical majority prediction
function predict(history) {
    const wins = history.filter(success).length;
    return wins > history.length / 2;
}

// Reproducible random baseline
function createRandomBaseline(seed = 42) {
    let state = seed;

    return history => {
        const positiveRate =
            history.filter(success).length / history.length;

        state = (state * 1664525 + 1013904223) % 4294967296;

        const randomValue = state / 4294967296;

        return randomValue < positiveRate;
    };
}

// Evaluate a prediction method
function evaluate(name, predictionFunction) {
    let correct = 0;
    let missed = 0;

    let truePositive = 0;
    let trueNegative = 0;
    let falsePositive = 0;
    let falseNegative = 0;

    for (let i = INITIAL_HISTORY; i < results.length; i++) {
        const history = results.slice(0, i);
        const prediction = predictionFunction(history);
        const actual = success(results[i]);

        if (prediction === actual) {
            correct++;
        } else {
            missed++;
        }

        if (prediction && actual) {
            truePositive++;
        } else if (!prediction && !actual) {
            trueNegative++;
        } else if (prediction && !actual) {
            falsePositive++;
        } else {
            falseNegative++;
        }
    }

    const metrics = calculateMetrics({
        truePositive,
        trueNegative,
        falsePositive,
        falseNegative
    });

    const {
        accuracy,
        precision,
        recall,
        specificity,
        f1
    } = metrics;

    console.log(`\n${name}`);
    console.log(`Correct: ${correct}`);
    console.log(`Incorrect: ${missed}`);
    console.log(`Accuracy: ${accuracy.toFixed(2)}%`);
    console.log(`Precision: ${precision.toFixed(2)}%`);
    console.log(`Recall: ${recall.toFixed(2)}%`);
    console.log(`F1 Score: ${f1.toFixed(2)}%`);
    console.log(`Specificity: ${specificity.toFixed(2)}%`);
    console.log(`True positives: ${truePositive}`);
    console.log(`True negatives: ${trueNegative}`);
    console.log(`False positives: ${falsePositive}`);
    console.log(`False negatives: ${falseNegative}`);

    return accuracy;
}

// Display analysis
console.log('\n====== AVIATOR HISTORICAL ANALYSIS ======');
console.log(`Rounds loaded: ${results.length}`);
console.log(`Target: ${TARGET}x`);
console.log(`At or above target: ${results.filter(success).length}`);
console.log(`Below target: ${results.filter(v => !success(v)).length}`);
console.log(`Initial training history: ${INITIAL_HISTORY}`);
console.log(`Out-of-sample rounds: ${results.length - INITIAL_HISTORY}`);

// Evaluate three approaches
const baselineAccuracy = evaluate(
    'EXPANDING HISTORICAL MAJORITY',
    history => predict(history)
);

const randomAccuracy = evaluate(
    'RANDOM BASELINE',
    createRandomBaseline()
);

const rollingAccuracy = evaluate(
    'ROLLING LAST FIVE ROUNDS',
    history => predict(history.slice(-WINDOW))
);

// Compare results
console.log('\n====== BASELINE COMPARISON ======');
console.log(`Expanding majority baseline: ${baselineAccuracy.toFixed(2)}%`);
console.log(`Rolling five-round strategy: ${rollingAccuracy.toFixed(2)}%`);
console.log(`Random baseline: ${randomAccuracy.toFixed(2)}%`);
console.log(`Rolling vs expanding: ${(rollingAccuracy - baselineAccuracy).toFixed(2)} percentage points`);
console.log(`Rolling vs random: ${(rollingAccuracy - randomAccuracy).toFixed(2)} percentage points`);

console.log('================================');
console.log('Historical results do not guarantee future outcomes.');
