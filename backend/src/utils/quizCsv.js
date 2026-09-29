/**
 * Quiz CSV helpers (pure functions, no database access).
 * Place in: backend/src/utils/quizCsv.js
 *
 * Expected CSV columns (header row required, order does not matter):
 *   question, type, option_a ... option_f, correct_answer,
 *   explanation, points, difficulty, category
 *
 * Supported types: MCQ_SINGLE (default), TRUE_FALSE
 * (The quiz engine grades ONE selected option per question, so
 *  MCQ_MULTIPLE cannot be graded correctly yet and is rejected.)
 */

const MAX_ROWS = 200;
const MAX_OPTIONS = 6;
const VALID_TYPES = ['MCQ_SINGLE', 'TRUE_FALSE'];
const VALID_DIFFICULTY = ['EASY', 'MEDIUM', 'HARD'];
const OPTION_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f'];

const HEADER_ALIASES = {
  question_text: 'question',
  questiontext: 'question',
  correct: 'correct_answer',
  answer: 'correct_answer',
  correctanswer: 'correct_answer'
};

/** Minimal RFC-4180 CSV parser (quotes, escaped quotes, newlines in quotes). */
function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // strip BOM

  // Excel in some regions saves with ';' instead of ','
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const delimiter =
    !firstLine.includes(',') && firstLine.includes(';') ? ';' : ',';

  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field);
      field = '';
    } else if (c === '\r') {
      // ignore
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }

  if (inQuotes) {
    throw new Error('The CSV has an opening quote (") that is never closed.');
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const normalizeHeader = (h) => {
  const key = String(h || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  return HEADER_ALIASES[key] || key;
};

/**
 * Parses + validates the CSV text.
 * Returns { items: [{ row, data }], errors: [{ row, message }], totalRows }
 *  - row  = spreadsheet row number (header is row 1)
 *  - data = object ready to be saved as a Question document
 */
function buildQuestionsFromCsv(csvText) {
  const errors = [];
  const items = [];

  let records;
  try {
    records = parseCsv(String(csvText || ''));
  } catch (err) {
    return { items, errors: [{ row: 0, message: err.message }], totalRows: 0 };
  }

  if (records.length === 0) {
    return { items, errors: [{ row: 0, message: 'The CSV file is empty.' }], totalRows: 0 };
  }

  const headers = records[0].map(normalizeHeader);
  const idx = {};
  headers.forEach((h, i) => {
    if (h && idx[h] === undefined) idx[h] = i;
  });

  for (const required of ['question', 'correct_answer']) {
    if (idx[required] === undefined) {
      errors.push({
        row: 1,
        message: `Missing required column "${required}". Download the template to see the correct headers.`
      });
    }
  }
  if (errors.length) return { items, errors, totalRows: 0 };

  // Keep spreadsheet row numbers, skip completely blank rows
  const dataRows = [];
  for (let r = 1; r < records.length; r++) {
    if (records[r].every((cell) => String(cell).trim() === '')) continue;
    dataRows.push({ row: r + 1, cells: records[r] });
  }

  if (dataRows.length === 0) {
    return { items, errors: [{ row: 0, message: 'The CSV has a header but no questions.' }], totalRows: 0 };
  }
  if (dataRows.length > MAX_ROWS) {
    return {
      items,
      errors: [{ row: 0, message: `Too many questions (${dataRows.length}). Maximum allowed per file is ${MAX_ROWS}.` }],
      totalRows: dataRows.length
    };
  }

  const seenQuestions = new Set();

  for (const { row, cells } of dataRows) {
    const get = (name) =>
      idx[name] === undefined ? '' : String(cells[idx[name]] ?? '').trim();
    const fail = (message) => errors.push({ row, message });

    const questionText = get('question');
    if (!questionText) {
      fail('Question text is empty.');
      continue;
    }
    const dupKey = questionText.toLowerCase();
    if (seenQuestions.has(dupKey)) {
      fail('Duplicate question (same text appears earlier in this file).');
      continue;
    }
    seenQuestions.add(dupKey);

    const type = (get('type') || 'MCQ_SINGLE').toUpperCase().replace(/[\s-]+/g, '_');
    if (type === 'MCQ_MULTIPLE') {
      fail('MCQ_MULTIPLE is not supported yet (the quiz engine accepts one answer per question). Use MCQ_SINGLE.');
      continue;
    }
    if (!VALID_TYPES.includes(type)) {
      fail(`Invalid type "${get('type')}". Use MCQ_SINGLE or TRUE_FALSE.`);
      continue;
    }

    // optional fields
    let difficulty = (get('difficulty') || 'MEDIUM').toUpperCase();
    if (!VALID_DIFFICULTY.includes(difficulty)) {
      fail(`Invalid difficulty "${get('difficulty')}". Use EASY, MEDIUM or HARD.`);
      continue;
    }

    let points = 10;
    if (get('points') !== '') {
      points = Number(get('points'));
      if (!Number.isFinite(points) || points <= 0) {
        fail(`Invalid points "${get('points')}". Use a positive number.`);
        continue;
      }
    }

    const explanation = get('explanation');
    const category = get('category') || 'General';
    const correctRaw = get('correct_answer');

    let options = [];
    let correctIndex = -1;

    if (type === 'TRUE_FALSE') {
      const v = correctRaw.toUpperCase();
      if (['TRUE', 'T'].includes(v)) correctIndex = 0;
      else if (['FALSE', 'F'].includes(v)) correctIndex = 1;
      else {
        fail(`For TRUE_FALSE the correct_answer must be TRUE or FALSE (got "${correctRaw}").`);
        continue;
      }
      options = [
        { text: 'True', isCorrect: correctIndex === 0 },
        { text: 'False', isCorrect: correctIndex === 1 }
      ];
    } else {
      const given = [];
      for (const letter of OPTION_LETTERS.slice(0, MAX_OPTIONS)) {
        const text = get(`option_${letter}`);
        if (text) given.push({ letter: letter.toUpperCase(), text });
      }
      if (given.length < 2) {
        fail('MCQ_SINGLE needs at least 2 options (option_a, option_b ...).');
        continue;
      }
      const lowered = given.map((o) => o.text.toLowerCase());
      if (new Set(lowered).size !== lowered.length) {
        fail('Two options have the same text.');
        continue;
      }
      if (/[|;,&]/.test(correctRaw) && correctRaw.length <= 5 && correctRaw.replace(/[^A-Za-z]/g, '').length > 1) {
        fail('MCQ_SINGLE allows exactly one correct answer (e.g. "B").');
        continue;
      }
      const pos = given.findIndex(
        (o) =>
          o.letter === correctRaw.toUpperCase() ||
          o.text.toLowerCase() === correctRaw.toLowerCase()
      );
      if (pos === -1) {
        fail(`correct_answer "${correctRaw}" does not match any option. Use a letter such as A, B, C or D.`);
        continue;
      }
      correctIndex = pos;
      options = given.map((o, i) => ({ text: o.text, isCorrect: i === pos }));
    }

    items.push({
      row,
      data: {
        questionText,
        type,
        options,
        correctAnswer: correctIndex,
        explanation,
        difficulty,
        category,
        points,
        status: 'ACTIVE'
      }
    });
  }

  return { items, errors, totalRows: dataRows.length };
}

module.exports = { parseCsv, buildQuestionsFromCsv, MAX_ROWS };