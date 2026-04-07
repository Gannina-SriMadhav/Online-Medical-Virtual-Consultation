package com.medconnect.backend.service;

import com.medconnect.backend.entity.Prescription;
import com.medconnect.backend.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }

    public Prescription issuePrescription(Prescription prescription) {
        return prescriptionRepository.save(prescription);
    }
    
    public List<Prescription> getPrescriptionsForPatient(Long patientId) {
        return prescriptionRepository.findByAppointmentPatientId(patientId);
    }

    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    public Prescription fulfillPrescription(Long id) {
        Prescription p = prescriptionRepository.findById(id).orElseThrow(() -> new RuntimeException("Prescription not found"));
        p.setIsFulfilled(true);
        return prescriptionRepository.save(p);
    }
}
