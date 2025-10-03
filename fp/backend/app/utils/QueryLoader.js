const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

const cache = new Map();

function loadQuery(id) {
  if (cache.size === 0) {
    const xml = fs.readFileSync(path.join(__dirname, '..', 'resources', 'queries.xml'), 'utf8');
    const parser = new XMLParser({ ignoreAttributes: false, trimValues: true, cdataPropName: 'cdata' });
    const doc = parser.parse(xml);
    const list = Array.isArray(doc.queries.query) ? doc.queries.query : [doc.queries.query];
    for (const q of list) cache.set(q['@_id'] || q.id, String(q.cdata ?? q).trim());
  }
  const sql = cache.get(id);
  if (!sql) throw new Error(`SQL not found: ${id}`);
  return sql;
}

module.exports = { loadQuery };
