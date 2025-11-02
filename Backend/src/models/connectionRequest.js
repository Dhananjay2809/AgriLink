import mongoose from "mongoose";

const followRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected", "cancelled", "removed"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate request documents
//
followRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

// Prevent self send request by the user
followRequestSchema.pre("save", function (next) {
  if (this.fromUserId.equals(this.toUserId)) {
    throw new Error("You cannot follow yourself!");
  }
  next();
});

const FollowRequestModel = mongoose.model("FollowRequest", followRequestSchema);

export { FollowRequestModel };
