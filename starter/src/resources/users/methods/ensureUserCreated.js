import db from 'db';
import _ from 'lodash';
import slug from 'slug';

const userService = db.services.users;

const formatUsername = ({ username, fullName, email }) => {
  return (
    username ||
    fullName ? slug(`${fullName.split(' ')[0]} ${fullName.split(' ')[1] || ''}`, '.') : email?.split('@')[0]
  );
};

const createUserAccount = async (userData) => {
  let username = formatUsername({ fullName: userData.fullName, email: userData.email });

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

     return { user: changedUser, isNew: false };
    } else {
      return { user, isNew: false };
    }
  }

  return {
    user: await createUserAccount(userData),
    isNew: true,
  };
};

export default async (userData) => {
  const { user, isNew } = await ensureUserCreated(userData);
  return user;
};