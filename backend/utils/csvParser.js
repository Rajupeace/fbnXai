/**
 * Simple CSV to JSON parser without external dependencies.
 * Handles quoted fields and basic CSV structure.
 */
function parseCSV(content) {
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const results = [];

    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i];
        const values = [];
        let currentVal = '';
        let inQuotes = false;

        for (let j = 0; j < currentLine.length; j++) {
            const char = currentLine[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentVal.trim());
                currentVal = '';
            } else {
                currentVal += char;
            }
        }
        values.push(currentVal.trim());

        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] !== undefined ? values[index] : '';
        });
        results.push(obj);
    }

    return results;
}

module.exports = { parseCSV };
