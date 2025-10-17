class User {
  constructor({ id, username, password_hash, active, created_at, organization_id }) {
    this.id = id;
    this.username = username;
    this.passwordHash = password_hash;
    this.active = !!active;
    this.createdAt = created_at;
    this.organizationId = organization_id;
  }
  static fromRow(row) { return row ? new User(row) : null; }
}

module.exports = User;