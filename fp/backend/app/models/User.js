class User {
  constructor({ id, username, passwordHash, active, createdAt }) {
    this.id = id;
    this.username = username;
    this.passwordHash = passwordHash;
    this.active = active;
    this.createdAt = createdAt;
  }
}
module.exports = User;