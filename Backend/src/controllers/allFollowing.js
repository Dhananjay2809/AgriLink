import FollowerModel from "../models/follower.js";
export const getMyFollowing = async (req, res) => {
  try {
    const userId = req.user.id;

    const following = await FollowerModel.find({ follower: userId })
      .populate("following", "firstname lastname username");

    return res.status(200).json({ 
         followingCount: following.length,
        following });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
