class User {
  constructor({id, username, password_hash, active, created_at, organization_id, role_id, role_name}) {
    this.id = id;
    this.username = username;
    this.passwordHash = password_hash;
    this.active = !!active;
    this.createdAt = created_at;
    this.organizationId = organization_id;
    this.roleId = role_id;
    this.roleName = role_name;
  }

  static fromRow(row) {
    return row ? new User(row) : null;
  }
}

module.exports = User;
