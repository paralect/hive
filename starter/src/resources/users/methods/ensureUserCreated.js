const _ = require('lodash');
const slug = require('slug');

const userService = require('db').services.users;

const formatUsername = ({ username, fullName }) => {
  return (
    username ||
    slug(`${fullName.split(' ')[0]} ${fullName.split(' ')[1] || ''}`, '.')
  );
};

const createUserAccount = async (userData) => {
  let username = formatUsername({ fullName: userData.fullName });

  if (await userService.exists({ username })) {
    username += _.random(1000, 9999);
  }

  const user = await userService.create({
    fullName: userData.fullName,
    username,
    email: userData.email,
    isEmailVerified: true,
    avatarUrl: userData.avatarUrl,
    oauth: userData.oauth,
  });

  return user;
};

const ensureUserCreated = async (userData) => {
  const user = await userService.findOne({ email: userData.email });

  if (user) {
    if (userData.oauth) {
      const changedUser = await userService.updateOne(
        { _id: user._id },
        (old) => {
          const newUser = old;
          newUser.oauth = old.oauth || {};
          newUser.oauth = {
            ...newUser.oauth,
            ...userData.oauth
          }
          newUser.isEmailVerified = true;

          return newUser;
        }
      );

     return { user: changedUser, isNew: true };
    } else {
      throw new Error(`User with email ${userData.email} already exists`);
    }
  }

  return {
    user: await createUserAccount(userData),
    isNew: true,
  };
};

module.exports = async (userData) => {
  const { updatedUser, isNew } = await ensureUserCreated(userData);
  return updatedUser;
};