package com.medconnect.backend.service;

import com.medconnect.backend.entity.Appointment;
import com.medconnect.backend.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    
    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    public List<Appointment> getAppointmentsForPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }
    
    public List<Appointment> getAppointmentsForDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }
    
    public Appointment createAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

    public void deleteAppointment(Long appointmentId) {
        appointmentRepository.deleteById(appointmentId);
    }

    public Appointment completeAppointment(Long appointmentId) {
        return appointmentRepository.findById(appointmentId).map(appointment -> {
            appointment.setStatus("COMPLETED");
            return appointmentRepository.save(appointment);
        }).orElseThrow(() -> new RuntimeException("Appointment not found"));
    }
}
