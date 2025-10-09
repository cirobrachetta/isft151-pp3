function toUserDTO(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    active: !!user.active,
    createdAt: user.createdAt,
  };
}

function toUserListDTO(users) {
  return users.map(toUserDTO);
}

module.exports = { toUserDTO, toUserListDTO };