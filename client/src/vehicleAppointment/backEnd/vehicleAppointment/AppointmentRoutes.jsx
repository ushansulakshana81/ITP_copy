import express from 'express';
import { deleteAppointment, updateAppointment,getAppointments, createNewAppointment, getAvailableSlots, getServiceHistoryByLicensePlate, searchServices } from './AppointmentController.jsx';
const router = express.Router();

router.post('/', createNewAppointment);

router.get('/slots/:date', getAvailableSlots);

router.get('/history/:licensePlate', getServiceHistoryByLicensePlate);
router.get('/services', searchServices);
router.get('/', getAppointments);
router.delete("/:id", deleteAppointment);
router.put("/:id", updateAppointment);

export default router;
