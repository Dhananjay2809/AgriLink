import { FollowRequestModel } from "../models/connectionRequest.js";
import { UserModel } from "../models/user.js"; // Only if you want to update follower count later

export const acceptFollowRequest = async (req, res) => {
  try {
    const requestId = req.params.id;   // Follow request document ID
    const loggedInUserId = req.user.id; // User accepting the request

    // Find the follow request
    const request = await FollowRequestModel.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Follow request not found" });
    }

    // Only the target user can accept the request
    if (request.toUserId.toString() !== loggedInUserId) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    // If already accepted or rejected
    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    // Update status to accepted
    request.status = "accepted";
    await request.save();

    return res.status(200).json({
      message: "Follow request accepted successfully",
      request
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
