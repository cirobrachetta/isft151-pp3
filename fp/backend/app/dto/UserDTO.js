function toUserDTO(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    active: !!user.active,
    createdAt: user.createdAt,
    organizationId: user.organizationId,
    role_id: user.roleId,
    role_name: user.roleName
  };
}

function toUserListDTO(users) {
  return users.map(toUserDTO);
}

module.exports = { toUserDTO, toUserListDTO };