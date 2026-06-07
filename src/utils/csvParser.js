/**
 * CSV and JSON Importer Parser for JIRA Issues
 */

/**
 * Parses JIRA CSV export and extracts ticket key and summary.
 * Maps:
 * - "Issue key" or "Key" -> ticketNumber
 * - "Summary" or "Title" -> title
 * @param {string} csvText 
 * @returns {Array<{ticketNumber: string, title: string}>}
 */
export const parseJiraCSV = (csvText) => {
  if (!csvText) return [];

  // Strip UTF-8 BOM prefix if present
  const cleanText = csvText.replace(/^\uFEFF/, '');

  // Auto-detect delimiter: comma (,) or semicolon (;)
  const firstLine = cleanText.split(/\r\n|\r|\n/)[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ';' : ',';

  // Parse CSV character-by-character to handle quotes and linebreaks inside cells
  const lines = [];
  let row = [""];
  let insideQuote = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        // Double quotes inside quotes represent literal quotes
        row[row.length - 1] += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === delimiter && !insideQuote) {
      row.push("");
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip LF
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }

  // Filter out completely empty lines and clean cell quotes
  const validLines = lines
    .map(line => line.map(cell => cell.trim().replace(/^["']|["']$/g, '')))
    .filter(line => line.some(cell => cell !== ""));

  if (validLines.length < 2) return [];

  // Find column indexes using headers (lowercased, trimmed, and quotes stripped)
  const headers = validLines[0].map(h => h.toLowerCase());
  
  let keyIdx = headers.findIndex(h => h === 'issue key' || h === 'key' || h === 'id' || h === 'issue_key');
  let summaryIdx = headers.findIndex(h => h === 'summary' || h === 'title' || h === 'name');

  // Fuzzy/contains index matching
  if (keyIdx === -1) {
    keyIdx = headers.findIndex(h => h.includes('issue key') || h.includes('issue_key'));
  }
  if (summaryIdx === -1) {
    summaryIdx = headers.findIndex(h => h.includes('summary'));
  }

  // STRICT RULE: Fail if headers are missing
  if (keyIdx === -1 || summaryIdx === -1) {
    const missing = [];
    if (keyIdx === -1) missing.push('"Issue key"');
    if (summaryIdx === -1) missing.push('"Summary"');
    throw new Error(`Missing required JIRA column header(s): ${missing.join(' and ')}.`);
  }

  const tickets = [];
  for (let i = 1; i < validLines.length; i++) {
    const r = validLines[i];
    if (r.length <= Math.max(keyIdx, summaryIdx)) continue;
    
    const ticketNumber = r[keyIdx];
    const title = r[summaryIdx];
    
    if (ticketNumber || title) {
      tickets.push({
        ticketNumber: ticketNumber || `TKT-${i}`,
        title: title || `Task ${i}`
      });
    }
  }

  return tickets;
};

/**
 * Parses JIRA JSON export and extracts ticket key and summary.
 * Expects schema: {"ticket": [{"issueKey": "...", "summary": "..."}]}
 * Or fallbacks for {"issues": [{"key": "...", "fields": {"summary": "..."}}]}
 * @param {string} jsonText 
 * @returns {Array<{ticketNumber: string, title: string}>}
 */
export const parseJiraJSON = (jsonText) => {
  if (!jsonText) return [];

  try {
    const data = JSON.parse(jsonText);
    
    // Schema 1: {"ticket": [{"issueKey": "...", "summary": "..."}]}
    if (data.ticket && Array.isArray(data.ticket)) {
      return data.ticket.map(t => ({
        ticketNumber: t.issueKey || t.issue_key || t.key || t.ticketNumber || '',
        title: t.summary || t.title || ''
      }));
    }

    // Schema 2: {"issues": [{"key": "...", "fields": {"summary": "..."}}]} (Standard Jira Rest API payload)
    if (data.issues && Array.isArray(data.issues)) {
      return data.issues.map(iss => ({
        ticketNumber: iss.key || '',
        title: iss.fields?.summary || iss.summary || ''
      }));
    }

    // Schema 3: Direct Array of tickets
    if (Array.isArray(data)) {
      return data.map(t => ({
        ticketNumber: t.issueKey || t.issue_key || t.key || t.ticketNumber || t.id || '',
        title: t.summary || t.title || t.description || ''
      }));
    }

    return [];
  } catch (err) {
    console.error("JSON parsing error: ", err);
    throw new Error("Invalid JSON format. Check console for details.", { cause: err });
  }
};
