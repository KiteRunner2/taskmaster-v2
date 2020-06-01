exports.removePassword = (user) => {
  user[0].password = "";
  return user;
};
