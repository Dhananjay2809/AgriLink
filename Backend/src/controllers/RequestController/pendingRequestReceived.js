import { FollowRequestModel } from "../../models/connectionRequest.js";

export const pendingRequestsReceived = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const pendingRequests = await FollowRequestModel.find({
            toUserId: loggedInUserId,
            status: "pending"
        })
        .populate("fromUserId", "firstname lastname email role profilePicture")
        .sort({ createdAt: -1 });
      
        // Return direct array for consistent frontend handling
        return res.status(200).json(pendingRequests);
        
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};