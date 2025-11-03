import { FollowRequestModel } from "../../models/connectionRequest.js";
import FollowerModel from "../../models/follower.js";

export const acceptFollowRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const loggedInUserId = req.user.id; // user who accepts

    const request = await FollowRequestModel.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Follow request not found" });
    }

    // Only the receiver can accept
    if (request.toUserId.toString() !== loggedInUserId) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    // ✅ Update follow request status
    request.status = "accepted";
    await request.save();

    // ✅ Create follower relationship
    await FollowerModel.create({
      follower: request.fromUserId,
      following: request.toUserId
    });

    return res.status(200).json({
      message: "Follow request accepted successfully",
      request
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
