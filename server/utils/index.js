exports.removePassword = (user) => {
let newUser = { ...user[0]};
console.log('newUser is:',newUser);
console.log('email is',newUser.email)
newUser.password = "";
  user[0]['password'] = "";
  console.log('loggin user after pass removal',newUser)
  return [newUser]
};
