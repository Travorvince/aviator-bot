const fs = require('fs');

function parseCsv(csvText) {
    const lines = csvText.trim().split(/\r?\n/);

    if (lines.length < 2) {
        throw new Error('CSV file has no data rows.');
    }

    if (lines[0].trim() !== 'Round,Multiplier') {
        throw new Error('Invalid CSV header. Expected: Round,Multiplier');
    }

    const records = [];
    let session = 1;
    let previousRound = 0;

    for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');

        if (columns.length !== 2) {
            throw new Error(`Invalid CSV format on row ${i + 1}`);
        }

        const round = Number(columns[0].trim());
        const multiplier = Number(columns[1].trim());

        if (!Number.isInteger(round) || round < 1) {
            throw new Error(`Invalid round number on row ${i + 1}`);
        }

        if (!Number.isFinite(multiplier) || multiplier <= 0) {
            throw new Error(`Invalid multiplier on row ${i + 1}`);
        }

        // A lower round number indicates a new session.
        if (round < previousRound) {
            session++;
        }

        records.push({ session, round, multiplier });
        previousRound = round;
    }

    return records;
}

function loadResults(filePath) {
    const csvText = fs.readFileSync(filePath, 'utf8');
    return parseCsv(csvText);
}

module.exports = { parseCsv, loadResults };