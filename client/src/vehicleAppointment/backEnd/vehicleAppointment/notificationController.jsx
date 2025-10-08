import Notification from "./notificationModel.jsx";

// Get all notifications
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

// Mark as read
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { status: "read" },
            { new: true }
        );
        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: "Failed to update notification" });
    }
};

// Create notification
export const createNotification = async (title, message) => {
    try {
        const notification = new Notification({ title, message });
        await notification.save();
    } catch (err) {
        console.error("Error creating notification:", err);
    }
};
