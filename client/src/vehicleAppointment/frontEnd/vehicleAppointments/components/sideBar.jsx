import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import NewForm from "./newAppForm";
import TableView from "./appointmentTable";
import Notifications from "./Notifications";
// import LogoutPopup from "../../logout";

export default function SideBar() {
    const [activeTab, setActiveTab] = useState(null);

    const tabs = [
        { label: "Apointment list", icon: "fa-list" },
        { label: "Add new", icon: "fa-file-alt" },
        { label: "Notifications", icon: "fa-bell" },
        { label: "Log out", icon: "fa-power-off" }

    ];

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const renderContent = () => {
        switch (activeTab) {
            case "Add new":
                return <NewForm />;
            case "Apointment list":
                return <TableView />;
            case "Notifications":
                return <Notifications />;
            case "Log out":
                return <LogoutPopup isOpen={true} onConfirm={() => {}} onCancel={() => setActiveTab(null)} />;
            default:
                return <TableView />;
        }
    };

    return (
        <div className="d-flex" style={{ height: "100vh" }}>
            {/* Static Sidebar */}
            <div
                className="bg-dark text-white p-3"
                style={{
                    width: "220px",
                    minHeight: "100vh",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    zIndex: 1040,
                }}
            >
                <h4 className="mb-4">My Modules</h4>
                <ul className="list-unstyled">
                    {tabs.map((tab, idx) => (
                        <li
                            key={idx}
                            className="mb-3 d-flex align-items-center"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleTabClick(tab.label)}
                        >
                            <i className={`fas ${tab.icon} me-2`}></i>
                            {tab.label}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Main Content */}
            <div
                className="flex-grow-1 p-4"
                style={{
                    marginLeft: "220px",
                    width: "100%",
                }}
            >
                {renderContent()}
            </div>
        </div>
    );
}
