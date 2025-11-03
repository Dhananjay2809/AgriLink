import FollowerModel from "../models/follower.js";

export const getMyFollowers = async (req, res) => {
  try {
    const userId = req.user.id;

    const followers = await FollowerModel.find({ following: userId })
      .populate("follower", "firstname lastname username");

    return res.status(200).json({ followers });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
