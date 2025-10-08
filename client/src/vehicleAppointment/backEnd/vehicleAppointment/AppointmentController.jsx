import Appointment from './AppointmentModel.jsx';
import { createNotification } from './notificationController.jsx';
import mongoose from 'mongoose';

const TIME_SLOTS = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM"
];

export const getAvailableSlots = async (req, res) => {
    try {
        const { date } = req.params;

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookedAppointments = await Appointment.find({
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        const bookedSlots = bookedAppointments.map(app => app.timeSlot);
        const availableSlots = TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));

        res.status(200).json({
            date,
            bookedSlots,
            availableSlots,
            allSlots: TIME_SLOTS
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// CREATE new appointment
export const createNewAppointment = async (req, res) => {
    try {
        const { vehicleMake, vehicleModel, licensePlate, serviceTypes, date, timeSlot } = req.body;

        if (!date || !timeSlot || !vehicleMake || serviceTypes.length === 0) {
            return res.status(400).json({ message: 'Missing required appointment details.' });
        }

        const exists = await Appointment.findOne({
            date: {
                $gte: new Date(date).setHours(0, 0, 0, 0),
                $lt: new Date(date).setHours(23, 59, 59, 999)
            },
            timeSlot
        });

        if (exists) {
            return res.status(409).json({ message: `Slot ${timeSlot} on ${date} is already booked.` });
        }

        const newAppointment = await Appointment.create({
            vehicleMake,
            vehicleModel,
            licensePlate,
            serviceTypes,
            date: new Date(date),
            timeSlot
        });

        // Fire notification asynchronously
        createNotification(
            "New Appointment Created",
            `Appointment for ${licensePlate} on ${new Date(date).toDateString()} at ${timeSlot} has been created.`
        ).catch(err => console.error("Notification error:", err));

        res.status(201).json({
            message: 'Appointment successfully created!',
            appointment: newAppointment
        });

    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        if (error.code === 11000) {
            return res.status(409).json({ message: 'License plate already has an active appointment.' });
        }
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

export const getServiceHistoryByLicensePlate = async (req, res) => {
    try {
        const { licensePlate } = req.params;

        const history = await Appointment.find({ licensePlate });

        if (history.length === 0) {
            return res.status(404).json({ message: 'No service history found for this license plate.' });
        }

        const uniqueServices = new Set();
        history.forEach(app => {
            app.serviceTypes.forEach(service => {
                uniqueServices.add(service);
            });
        });

        res.status(200).json({
            licensePlate,
            serviceHistory: history,
            uniqueServices: Array.from(uniqueServices)
        });

    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

export const searchServices = async (req, res) => {
    try {
        const { q } = req.query;
        const regex = new RegExp(q, 'i'); // Case-insensitive search

        // Find all unique service types in the database
        const allServiceTypes = await Appointment.find().distinct('serviceTypes');

        const filteredServices = allServiceTypes.filter(service => regex.test(service));

        res.status(200).json({ services: filteredServices });
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ message: 'Error fetching services' });
    }
};

// get appointment list
export const getAppointments = async (req, res) => {
    try {
        const { date, service } = req.query;
        const query = {};

        //Date Filtering
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            query.date = { $gte: start, $lte: end };
        }

        //Service Filtering
        if (service) {
            query.serviceTypes = service;
        }

        const appointments = await Appointment.find(query).lean();
        res.json(appointments);
    } catch (err) {
        console.error("Error fetching appointments:", err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE appointment by ID
export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Appointment.findByIdAndDelete(id);

        if (!deleted) return res.status(404).json({ message: "Appointment not found" });

        // Fire notification asynchronously (doesn't block response)
        createNotification(
            "Appointment Cancelled",
            `Appointment with ID ${id} for ${deleted.licensePlate} has been cancelled.`
        ).catch(err => console.error("Notification error:", err));

        res.json({ message: "Appointment deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// UPDATE appointment by ID
export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Appointment.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updated) return res.status(404).json({ message: "Appointment not found" });

        // Fire notification asynchronously
        createNotification(
            "Appointment Updated",
            `Appointment on ${updated.date.toDateString()} at ${updated.timeSlot} for ${updated.licensePlate} has been updated.`
        ).catch(err => console.error("Notification error:", err));

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};