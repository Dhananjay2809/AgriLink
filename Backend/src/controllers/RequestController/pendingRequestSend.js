import { FollowRequestModel } from "../../models/connectionRequest.js";

export const pendingRequestsSent = async (req, res) => {
    try {
        const userId = req.user.id;
        const requests = await FollowRequestModel.find({
            fromUserId: userId,
            status: "pending"
        })
        .populate("toUserId", "firstname lastname email role profilePicture")
        .sort({ createdAt: -1 });
        // Return direct array for consistent frontend handling
        return res.status(200).json(requests);
        
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};