import * as User from '#models/user.js';

export const update = async (req, res) => {
  const { user_id } = req.params;
  const data = req.body;
  const user = await User.update(user_id, data);

  res.status(200).send(user);
};
