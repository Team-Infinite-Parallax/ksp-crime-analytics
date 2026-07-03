const fs = require('fs');
const path = require('path');
const catalyst = require('zcatalyst-sdk-node');

const OUTPUT_DIR = path.join(__dirname, 'output');
const ORDER_FILE = path.join(OUTPUT_DIR, 'import_order.txt');
const BATCH_SIZE = 500;
const MAX_RETRIES = 3;

// Primary key mapping for the 28 tables to support duplicate checking
const TABLE_PKS = {
  State: 'StateID',
  GravityOffence: 'GravityOffenceID',
  District: 'DistrictID',
  UnitType: 'UnitTypeID',
  Unit: 'UnitID',
  Rank: 'RankID',
  Designation: 'DesignationID',
  Employee: 'EmployeeID',
  Act: 'ActID',
  Section: 'SectionID',
  CrimeHead: 'CrimeHeadID',
  CrimeSubHead: 'CrimeSubHeadID',
  CrimeHeadActSection: 'CHASID',
  CaseCategory: 'CaseCategoryID',
  CaseStatusMaster: 'CaseStatusID',
  OccupationMaster: 'OccupationID',
  ReligionMaster: 'ReligionID',
  CasteMaster: 'CasteID',
  Court: 'CourtID',
  CaseMaster: 'CaseID',
  OccurrenceTime: 'OccurrenceTimeID',
  ComplainantDetails: 'ComplainantID',
  Victim: 'VictimID',
  Accused: 'AccusedID',
  ActSectionAssociation: 'AssocID',
  ArrestSurrender: 'ArrestID',
  ChargesheetDetails: 'CSID',
  DistrictStats: 'DistrictID'
};

function parseCSVLine(line) {
  const fields = [];
  let cur = '';
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === ',' && !inQ) { fields.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  fields.push(cur.trim());
  return fields;
}

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = [];
  let cur = '';
  let inQ = false;
  for (const ch of content) {
    if (ch === '"') { inQ = !inQ; cur += ch; continue; }
    if (ch === '\n' && !inQ) { if (cur.trim()) lines.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) lines.push(cur);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    if (vals.length !== headers.length) {
      console.warn(`    [WARN] Line ${i + 1}: expected ${headers.length} cols, got ${vals.length}`);
      continue;
    }
    const row = {};
    headers.forEach((h, idx) => {
      let v = vals[idx];
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      row[h] = v === '' ? null : v;
    });
    rows.push(row);
  }
  return rows;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Safely format values for CoQL query syntax (handling numeric vs. text)
function formatCoQLValue(val) {
  if (typeof val === 'number') return val;
  if (!isNaN(val) && val.trim() !== '') return Number(val);
  return `'${val.replace(/'/g, "''")}'`;
}

// Checks if records in the current batch already exist in Catalyst and filters them out
async function filterExistingInBatch(datastore, tableName, pkColumn, batch) {
  if (!pkColumn) return batch;
  const ids = batch.map(row => row[pkColumn]).filter(id => id !== undefined && id !== null);
  if (ids.length === 0) return batch;

  const existingIds = new Set();
  const subBatchSize = 40; // Keeps CoQL query lengths within safe limits
  
  for (let i = 0; i < ids.length; i += subBatchSize) {
    const subIds = ids.slice(i, i + subBatchSize);
    const whereClause = subIds.map(id => `${pkColumn} = ${formatCoQLValue(id)}`).join(' OR ');
    const queryStr = `SELECT ${pkColumn} FROM ${tableName} WHERE ${whereClause}`;
    try {
      const result = await datastore.executeCoQLQuery(queryStr);
      if (result && result.length > 0) {
        result.forEach(row => {
          const idVal = row[tableName][pkColumn];
          if (idVal !== undefined && idVal !== null) {
            existingIds.add(idVal.toString());
          }
        });
      }
    } catch (err) {
      // If table is empty or error is due to non-existent rows, we ignore and assume no duplicates
      const msg = err.message.toLowerCase();
      if (!msg.includes('does not exist') && !msg.includes('empty')) {
        console.warn(`    [WARN] Duplicate check failed for sub-batch in ${tableName} (will attempt insert): ${err.message}`);
      }
    }
  }

  // Return only rows that do not exist in the database
  return batch.filter(row => {
    const rowId = row[pkColumn];
    return rowId === undefined || rowId === null || !existingIds.has(rowId.toString());
  });
}

async function insertWithRetry(table, batch, tableName, batchNum, totalBatches) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await table.insertBulk(batch);
      console.log(`  [BATCH ${batchNum}/${totalBatches}] ${batch.length} rows inserted successfully`);
      return;
    } catch (err) {
      console.error(`  [RETRY ${attempt}/${MAX_RETRIES}] Batch ${batchNum}/${totalBatches} for ${tableName} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        const backoff = 2000 * attempt;
        await sleep(backoff);
      } else {
        throw err;
      }
    }
  }
}

(async () => {
  try {
    const config = {};
    if (process.env.CATALYST_PROJECT_ID) {
      config.project_id = process.env.CATALYST_PROJECT_ID;
      config.project_key = process.env.CATALYST_PROJECT_KEY;
      config.environment = process.env.CATALYST_ENVIRONMENT;
    }
    const app = catalyst.initializeApp(config);
    const datastore = app.datastore();

    if (!fs.existsSync(ORDER_FILE)) {
      console.error(`[FATAL] ${ORDER_FILE} not found`);
      process.exit(1);
    }

    const order = fs.readFileSync(ORDER_FILE, 'utf8')
      .trim()
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    console.log(`[START] Importing ${order.length} tables from ${OUTPUT_DIR}\n`);

    for (const fileName of order) {
      const tableName = fileName.replace(/\.csv$/i, '');
      const csvPath = path.join(OUTPUT_DIR, fileName);

      if (!fs.existsSync(csvPath)) {
        console.warn(`[SKIP] ${fileName} not found`);
        continue;
      }

      console.log(`[IMPORT] Processing "${tableName}" from ${fileName}...`);
      const rows = parseCSV(csvPath);
      if (rows.length === 0) {
        console.log(`  [DONE] 0 rows (empty file)`);
        continue;
      }

      const table = datastore.table(tableName);
      const pkColumn = TABLE_PKS[tableName];
      const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

      let totalSkipped = 0;
      let totalInserted = 0;

      for (let b = 0; b < totalBatches; b++) {
        const rawBatch = rows.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
        
        // Skip duplicates using batch-level CoQL check
        const cleanBatch = await filterExistingInBatch(datastore, tableName, pkColumn, rawBatch);
        const skippedInBatch = rawBatch.length - cleanBatch.length;
        totalSkipped += skippedInBatch;

        if (cleanBatch.length === 0) {
          console.log(`  [BATCH ${b + 1}/${totalBatches}] All ${rawBatch.length} rows already exist (skipped)`);
          continue;
        }

        if (skippedInBatch > 0) {
          console.log(`  [BATCH ${b + 1}/${totalBatches}] ${skippedInBatch} duplicates skipped, preparing to insert remaining ${cleanBatch.length} rows`);
        }

        await insertWithRetry(table, cleanBatch, tableName, b + 1, totalBatches);
        totalInserted += cleanBatch.length;
      }

      console.log(`[DONE] "${tableName}": ${totalInserted} rows inserted, ${totalSkipped} duplicates skipped. (Total: ${rows.length})\n`);
    }

    console.log('='.repeat(64));
    console.log('[COMPLETE] All tables processed successfully.');
    console.log('='.repeat(64));
  } catch (err) {
    console.error('\n[FATAL] Import process failed:', err);
    process.exit(1);
  }
})();
