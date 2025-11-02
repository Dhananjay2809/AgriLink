import { FollowRequestModel } from "../models/connectionRequest.js";

export const sendFollowRequest = async (req, res) => {
  try {
    const fromUserId = req.user.id;        // Logged-in user (sender)
    const toUserId = req.params.id;        // Target user (receiver)

    // Prevent self-follow
    if (fromUserId === toUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Check existing follow request
    const existingRequest = await FollowRequestModel.findOne({ fromUserId, toUserId });
    if (existingRequest) {
      return res.status(400).json({ message: "Follow request already exists!" });
    }

    // Create follow request
    const followRequest = await FollowRequestModel.create({ fromUserId, toUserId });

    return res.status(201).json({
      message: "Follow request sent successfully",
      request: followRequest
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
