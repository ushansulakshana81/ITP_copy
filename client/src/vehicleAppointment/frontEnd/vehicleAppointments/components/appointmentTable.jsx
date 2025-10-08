// src/components/AppointmentTable.jsx
import React, { useEffect, useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AppointmentPDF from "./AppointmentPDF";

const AppointmentTable = () => {
    const [appointments, setAppointments] = useState([]);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({});
    const [filterDate, setFilterDate] = useState("");
    const [filterService, setFilterService] = useState("");

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/appointments");
            const data = await res.json();
            setAppointments(data);
        } catch (err) {
            console.error("Error fetching appointments:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this appointment?")) return;
        await fetch(`http://localhost:5000/api/appointments/${id}`, { method: "DELETE" });
        fetchAppointments();
    };

    const handleEditClick = (appointment) => {
        setEditing(appointment._id);
        setFormData({
            ...appointment,
            date: appointment.date.substring(0, 10),
        });
    };

    const handleUpdate = async () => {
        await fetch(`http://localhost:5000/api/appointments/${editing}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        setEditing(null);
        fetchAppointments();
    };

    // Unique service types for filter dropdown
    const allUniqueServices = useMemo(() => {
        const services = new Set();
        appointments.forEach((apt) => apt.serviceTypes.forEach((s) => services.add(s)));
        return Array.from(services).sort();
    }, [appointments]);

    // Filtered appointments
    const filteredAppointments = useMemo(() => {
        return appointments.filter((apt) => {
            const matchesDate = filterDate ? apt.date.substring(0, 10) === filterDate : true;
            const matchesService = filterService
                ? apt.serviceTypes.includes(filterService)
                : true;
            return matchesDate && matchesService;
        });
    }, [appointments, filterDate, filterService]);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Appointments</h2>

            {/* Filters + Export */}
            <div className="row mb-3 align-items-end">
                <div className="col-md-3">
                    <label htmlFor="filterDate" className="form-label">Filter by Date</label>
                    <input
                        type="date"
                        id="filterDate"
                        className="form-control"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
                <div className="col-md-3">
                    <label htmlFor="filterService" className="form-label">Filter by Service</label>
                    <select
                        id="filterService"
                        className="form-select"
                        value={filterService}
                        onChange={(e) => setFilterService(e.target.value)}
                    >
                        <option value="">All Services</option>
                        {allUniqueServices.map((service) => (
                            <option key={service} value={service}>{service}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                    <button
                        className="btn btn-secondary w-100"
                        onClick={() => { setFilterDate(""); setFilterService(""); }}
                    >
                        <i className="fas fa-redo me-2"></i>Reset Filters
                    </button>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                    <AppointmentPDF appointments={filteredAppointments} />
                </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
                <table className="table table-striped table-bordered table-hover w-100">
                    <thead className="table-dark">
                        <tr>
                            <th>Vehicle</th>
                            <th>License Plate</th>
                            <th>Service Types</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.length > 0 ? (
                            filteredAppointments.map((a) => (
                                <tr key={a._id}>
                                    <td>{editing === a._id ?
                                        <input
                                            className="form-control form-control-sm"
                                            value={formData.vehicleMake + " " + formData.vehicleModel}
                                            onChange={(e) =>
                                                setFormData({ ...formData, vehicleMake: e.target.value.split(" ")[0], vehicleModel: e.target.value.split(" ")[1] || "" })
                                            }
                                        />
                                        : <>{a.vehicleMake} {a.vehicleModel}</>
                                    }</td>
                                    <td>{editing === a._id ?
                                        <input
                                            className="form-control form-control-sm"
                                            value={formData.licensePlate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, licensePlate: e.target.value })
                                            }
                                        />
                                        : a.licensePlate
                                    }</td>
                                    <td>{editing === a._id ?
                                        <input
                                            className="form-control form-control-sm"
                                            value={formData.serviceTypes.join(", ")}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    serviceTypes: e.target.value.split(",").map((s) => s.trim()),
                                                })
                                            }
                                        />
                                        : a.serviceTypes.join(", ")
                                    }</td>
                                    <td>{editing === a._id ?
                                        <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            value={formData.date}
                                            onChange={(e) =>
                                                setFormData({ ...formData, date: e.target.value })
                                            }
                                        />
                                        : new Date(a.date).toLocaleDateString()
                                    }</td>
                                    <td>{editing === a._id ?
                                        <input
                                            className="form-control form-control-sm"
                                            value={formData.timeSlot}
                                            onChange={(e) =>
                                                setFormData({ ...formData, timeSlot: e.target.value })
                                            }
                                        />
                                        : a.timeSlot
                                    }</td>
                                    <td>{editing === a._id ?
                                        <select
                                            className="form-select form-select-sm"
                                            value={formData.status}
                                            onChange={(e) =>
                                                setFormData({ ...formData, status: e.target.value })
                                            }
                                        >
                                            <option value="Booked">Booked</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                        : <span className={`badge ${a.status === "Completed" ? "bg-success" :
                                            a.status === "Cancelled" ? "bg-danger" : "bg-warning text-dark"
                                            }`}>{a.status}</span>
                                    }</td>
                                    <td className="text-center">
                                        {editing === a._id ? (
                                            <>
                                                <button className="btn btn-success btn-sm me-1" onClick={handleUpdate} title="Save">
                                                    <i className="fas fa-check"></i>
                                                </button>
                                                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)} title="Cancel">
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="btn btn-warning btn-sm me-1" onClick={() => handleEditClick(a)} title="Edit">
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a._id)} title="Delete">
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center text-muted">
                                    No appointments found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AppointmentTable;
