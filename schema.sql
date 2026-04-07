CREATE DATABASE IF NOT EXISTS medconnect;
USE medconnect;

CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `age` INT DEFAULT NULL,
  `certificate_path` VARCHAR(500) DEFAULT NULL,
  `email` VARCHAR(255) NOT NULL,
  `license_number` VARCHAR(255) DEFAULT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN','DOCTOR','PATIENT','PHARMACIST') NOT NULL,
  `specialist` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `appointments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `appointment_date` DATETIME(6) NOT NULL,
  `status` VARCHAR(255) DEFAULT NULL,
  `doctor_id` BIGINT NOT NULL,
  `patient_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_appt_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_appt_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `medical_records` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `diagnosis` VARCHAR(2000) NOT NULL,
  `record_date` DATETIME(6) DEFAULT NULL,
  `treatment_plan` VARCHAR(2000) DEFAULT NULL,
  `doctor_id` BIGINT NOT NULL,
  `patient_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `FK_mr_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_mr_patient` FOREIGN KEY (`patient_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `prescriptions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `instructions` VARCHAR(255) DEFAULT NULL,
  `issued_at` DATETIME(6) DEFAULT NULL,
  `medication_details` VARCHAR(1000) NOT NULL,
  `appointment_id` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_appointment_rx` (`appointment_id`),
  CONSTRAINT `FK_rx_appt` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
