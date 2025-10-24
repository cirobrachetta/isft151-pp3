const { loadQuery } = require('../utils/QueryLoader');
const { getDB } = require('../../db/connection');

const db = getDB();

const SelectAll = db.prepare(loadQuery('organizations.selectAll'));
const Insert = db.prepare(loadQuery('organizations.insert'));

const OrganizationDAO = {
  selectAll() {
    return SelectAll.all();
  },
  insert({ name, contact }) {
    const info = Insert.run({ name, contact });
    return { id: info.lastInsertRowid, name, contact };
  },
};

module.exports = OrganizationDAO;