import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Styles/notificationPanel.css"

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/notifications");
            const data = await res.json();
            setNotifications(data);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
            });
            await fetchNotifications(); // refresh list
            setSelectedNotification(null);
        } catch (err) {
            console.error("Error marking notification as read:", err);
        }
    };

    return (
        <div className="container mt-4">
            <h3 className="mb-3">Notifications</h3>
            <ul className="list-group">
                {notifications.map((n) => (
                    <li
                        key={n._id}
                        className={`list-group-item d-flex justify-content-between align-items-center ${n.status === "read" ? "text-muted" : "fw-bold"
                            }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedNotification(n)}
                    >
                        {n.title}
                        {n.status === "unread" && (
                            <span className="badge bg-primary">New</span>
                        )}
                    </li>
                ))}
            </ul>

            {/* Modal */}
            {selectedNotification && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{selectedNotification.title}</h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setSelectedNotification(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>{selectedNotification.message}</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedNotification(null)}
                                >
                                    Close
                                </button>
                                {selectedNotification.status === "unread" && (
                                    <button
                                        className="btn btn-success"
                                        onClick={() => markAsRead(selectedNotification._id)}
                                    >
                                        Mark as Read
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;