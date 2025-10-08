import React, { useState, useEffect } from 'react';
import "../Styles/newAppForm.css";

const TIME_SLOTS = [
    "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM",
    "03:00 PM", "04:00 PM"
];

function clearFormFields(setters) {
    setters.forEach(setter => {
        if (setter.name && setter.name.includes('serviceTypes')) {
            setter([]);
        } else {
            setter('');
        }
    });
}

function NewAppForm({ onCancel, onSubmit }) {
    const [vehicleMake, setVehicleMake] = useState('');
    const [vehicleModel, setVehicleModel] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [serviceTypes, setServiceTypes] = useState([]);
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');

    const [serviceSearchTerm, setServiceSearchTerm] = useState('');

    const [suggestedServices, setSuggestedServices] = useState([]);
    const [isServicesLoading, setIsServicesLoading] = useState(false);
    const [servicesError, setServicesError] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [bookSlots, setBookSlots] = useState([]);
    const [isSlotsLoading, setIsSlotsLoading] = useState(false);

    const allUniqueServices = [...new Set([...suggestedServices, ...serviceTypes])];

    const filteredServices = allUniqueServices.filter(type =>
        type.toLowerCase().includes(serviceSearchTerm.toLowerCase())
    ).sort();

    // get booked slolots
    const fetchBookedSlots = async (selectedDate) => {
        setIsSlotsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/appointments/slots/${selectedDate}`);

            if (!response.ok) {
                throw new Error('Failed to get pre-booked slots from the server.');
            }
            const data = await response.json();
            setBookSlots(data.bookedSlots || []);

        } catch (err) {
            console.error("Error fetching booked slots:", err);
            setError('Error fetching booked slots. Please try again later.');
            setBookSlots([]);
        } finally {
            setIsSlotsLoading(false);
        }
    };

    // serch services
    const searchForServices = async (searchTerm) => {
        if (!searchTerm) {
            setSuggestedServices([]);
            return;
        }

        setIsServicesLoading(true);
        setServicesError(null);

        try {
            const response = await fetch(`/api/appointments/services?q=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) {
                throw new Error('Failed to search for services.');
            }
            const data = await response.json();
            setSuggestedServices(data.services || []);
        } catch (err) {
            console.error("Error searching for services:", err);
            setServicesError(err.message);
            setSuggestedServices([]);
        } finally {
            setIsServicesLoading(false);
        }
    };

    useEffect(() => {
        setTimeSlot('');
        if (date) {
            fetchBookedSlots(date);
        } else {
            setBookSlots([]);
        }
    }, [date]);

    useEffect(() => {
        const handler = setTimeout(() => {
            searchForServices(serviceSearchTerm);
        }, 500); // 500ms

        return () => {
            clearTimeout(handler);
        };
    }, [serviceSearchTerm]);

    const handleServiceTypeChange = (type) => {
        const normalizedType = type.trim();
        setServiceTypes(prev =>
            prev.includes(normalizedType)
                ? prev.filter(t => t !== normalizedType)
                : [...prev, normalizedType]
        );
    };

    const handleServiceSearchChange = (e) => {
        setServiceSearchTerm(e.target.value);
    }

    const handleNewServiceAdd = (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const newService = serviceSearchTerm.trim();

        if (newService.length > 2 && !serviceTypes.includes(newService)) {
            handleServiceTypeChange(newService);
            setServiceSearchTerm('');
        } else if (serviceTypes.includes(newService)) {
            setServiceSearchTerm('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const appointmentData = {
            vehicleMake,
            vehicleModel,
            licensePlate,
            serviceTypes,
            date,
            timeSlot
        };

        if (!timeSlot || serviceTypes.length === 0) {
            setError('Please select a date, time slot, and at least one service.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointmentData)
            });

            const json = await response.json();

            if (!response.ok) {
                throw new Error(json.message || 'Failed to create appointment due to a server error.');
            }

            console.log('Appointment Successfully Created:', json.appointment);
            alert('Appointment Booked Successfully!');

            if (onSubmit) onSubmit(json.appointment);

            clearFormFields([
                setVehicleMake,
                setVehicleModel,
                setLicensePlate,
                setServiceTypes,
                setDate,
                setTimeSlot,
                setServiceSearchTerm
            ]);
            if (typeof onCancel === 'function') onCancel();

        } catch (err) {
            console.error("Submission Error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const currentBookedSlots = bookSlots;
    const today = new Date().toISOString().split('T')[0];

    const isNewService = serviceSearchTerm.trim().length > 2 &&
        !allUniqueServices.includes(serviceSearchTerm.trim()) &&
        !serviceTypes.includes(serviceSearchTerm.trim());

    return (
        <div className="overlay">
            <form className="form-container" onSubmit={handleSubmit}>
                <h2>New Vehicle Appointment</h2>

                <fieldset className="fieldset">
                    <legend>Vehicle Information</legend>
                    <label>
                        Vehicle Make:
                        <input
                            type="text"
                            value={vehicleMake}
                            onChange={e => setVehicleMake(e.target.value)}
                            required
                            className="input-field"
                        />
                    </label>
                    <br />
                    <label>
                        Vehicle Model:
                        <input
                            type="text"
                            value={vehicleModel}
                            onChange={e => setVehicleModel(e.target.value)}
                            required
                            className="input-field"
                        />
                    </label>
                    <br />
                    <label>
                        License Plate:
                        <input
                            type="text"
                            value={licensePlate}
                            onChange={e => setLicensePlate(e.target.value)}
                            required
                            className="input-field"
                        />
                    </label>
                </fieldset>

                <fieldset className="fieldset">
                    <legend>Service Information</legend>

                    <label>
                        Search or Add Service:
                        <input
                            type="text"
                            placeholder="Type to filter, or press Enter to add new service"
                            value={serviceSearchTerm}
                            onChange={handleServiceSearchChange}
                            onKeyPress={handleNewServiceAdd}
                            className="input-field"
                        />
                    </label>

                    {serviceTypes.length > 0 && (
                        <div style={{ marginBottom: '10px', fontSize: '0.9em' }}>
                            <strong>Selected Services: </strong>
                            {serviceTypes.map((type) => (
                                <span
                                    key={type}
                                    style={{
                                        marginRight: '8px',
                                        padding: '3px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: '#c8e6c9',
                                        border: '1px solid #388e3c',
                                        cursor: 'pointer',
                                        display: 'inline-block'
                                    }}
                                    onClick={() => handleServiceTypeChange(type)}
                                >
                                    {type} <span style={{ fontWeight: 'bold', marginLeft: '5px' }}>✕</span>
                                </span>
                            ))}
                        </div>
                    )}

                    {isNewService && (
                        <button
                            type="button"
                            onClick={() => handleServiceTypeChange(serviceSearchTerm.trim())}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: '#2196f3',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                marginBottom: '15px',
                                cursor: 'pointer',
                                transition: 'opacity 0.2s'
                            }}
                        >
                            + Add New Service: "{serviceSearchTerm.trim()}"
                        </button>
                    )}

                    <div className="checklist">
                        {isServicesLoading ? (
                            <p style={{ color: '#1976d2' }}>Searching for services...</p>
                        ) : filteredServices.length > 0 ? (
                            filteredServices.map(type => {
                                const isSelected = serviceTypes.includes(type);
                                return (
                                    <button
                                        type="button"
                                        key={type}
                                        onClick={() => handleServiceTypeChange(type)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: '4px',
                                            border: isSelected ? '2px solid #388e3c' : '1px solid #ccc',
                                            background: isSelected ? '#4caf50' : '#f0f8ff',
                                            color: isSelected ? '#fff' : '#1976d2',
                                            cursor: 'pointer',
                                            fontWeight: isSelected ? 'bold' : 'normal'
                                        }}
                                    >
                                        {isSelected ? '✓ ' : '+ '}{type}
                                    </button>
                                );
                            })
                        ) : (
                            <p style={{ color: '#ff5722' }}>
                                {servicesError || `No services match "${serviceSearchTerm}". Type a new service and press Enter to add it.`}
                            </p>
                        )}
                    </div>
                </fieldset>

                <fieldset className="fieldset">
                    <legend>Date & Time Selection</legend>
                    <label>
                        Date:
                        <input
                            type="date"
                            value={date}
                            min={today}
                            onChange={e => {
                                setDate(e.target.value);
                            }}
                            required
                            className="input-field"
                        />
                    </label>
                    <div className="time-slots-container">
                        {isSlotsLoading ? (
                            <p style={{ color: '#1976d2' }}>Loading available slots...</p>
                        ) : TIME_SLOTS.map(slot => {
                            const isBooked = currentBookedSlots.includes(slot);
                            const isSelected = timeSlot === slot;

                            return (
                                <button
                                    type="button"
                                    key={slot}
                                    disabled={!date || isBooked}
                                    onClick={() => setTimeSlot(slot)}
                                    className="time-slot-btn"
                                    style={{
                                        background: isBooked
                                            ? '#ccc'
                                            : isSelected
                                                ? '#4caf50'
                                                : '#e0ffe0',
                                        color: isBooked
                                            ? '#888'
                                            : isSelected
                                                ? '#fff'
                                                : '#222',
                                        borderColor: isSelected ? '#388e3c' : '#ccc'
                                    }}
                                >
                                    {slot}
                                </button>
                            );
                        })}
                    </div>
                </fieldset>

                {error && <div className="error-box">Error: {error}</div>}

                <div className="button-row">
                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={isLoading || !timeSlot || serviceTypes.length === 0}
                    >
                        {isLoading ? 'Booking...' : 'Submit'}
                    </button>
                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NewAppForm;