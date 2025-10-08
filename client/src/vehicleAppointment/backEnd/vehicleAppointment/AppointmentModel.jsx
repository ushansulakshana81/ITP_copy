import mongoose from "mongoose";

const { Schema } = mongoose;

const AppointmentSchema = new Schema(
    {
        vehicleMake: {
            type: String,
            required: [true, "Vehicle make is required"],
            trim: true,
        },
        vehicleModel: {
            type: String,
            required: [true, "Vehicle model is required"],
            trim: true,
        },
        licensePlate: {
            type: String,
            required: [true, "License plate is required"],
            unique: true,
            uppercase: true,
            trim: true,
        },
        serviceTypes: {
            type: [String],
            required: [true, "At least one service type is required"],
            validate: {
                validator: (v) => Array.isArray(v) && v.length > 0,
                message: "Appointment must include at least one service type",
            },
        },
        date: {
            type: Date,
            required: [true, "Appointment date is required"],
        },
        timeSlot: {
            type: String,
            required: [true, "Time slot is required"],
            trim: true,
        },
        status: {
            type: String,
            enum: ["Booked", "Completed", "Cancelled"],
            default: "Booked",
        },
    },
    {
        timestamps: true,
        collection: "Appointments",
        toJSON: {
            virtuals: true,
            transform: (_, ret) => {
                delete ret.__v;
            },
        },
        toObject: {
            virtuals: true,
        },
    }
);

// Prevent duplicate appointments at the same date & time
AppointmentSchema.index({ date: 1, timeSlot: 1 }, { unique: true });

// Already unique license plate, but index makes queries faster
AppointmentSchema.index({ licensePlate: 1 }, { unique: true });

const Appointment = mongoose.model("Appointment", AppointmentSchema);

export default Appointment;
