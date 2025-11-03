import { FollowRequestModel } from "../models/connectionRequest.js";


export const cancelFollowRequest= async (req,res)=>{
    try{
     const requestId = req.params.id;   // Follow request document ID
    const loggedInUserId = req.user.id; // User accepting the request
   
    // Find the follow request in te FollowRequestModel
    const request = await FollowRequestModel.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Follow request not found" });
    }
    // only sender can reject the request
    if (request.fromUserId.toString() !== loggedInUserId) {
      return res.status(403).json({ message: "You are not authorized to cancel this request" });
    }
   // Cannot cancel if already accepted, rejected, or cancelled
    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    request.status = "cancelled";
    await request.save();

    return res.status(200).json({
      message: "Follow request cancelled successfully",
      request
    });
} catch(err){
    return res.status(500).json({ error: err.message });
}
};