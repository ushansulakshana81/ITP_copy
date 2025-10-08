import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ["unread", "read"],
            default: "unread",
        },
    },
    { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema, "Notifications");

export default Notification;
