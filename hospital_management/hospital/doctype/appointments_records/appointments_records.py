# Copyright (c) 2026, paul and contributors
# For license information, please see license.txt
# appointment_records/appointment_records.py

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime


class AppointmentsRecords(Document):

    def before_insert(self):
        self.booked_on = now_datetime()
        self.booked_by = frappe.session.user

    def validate(self):
        self.check_slot_availability()
        self.set_consultation_fee()

    def check_slot_availability(self):
        conflict = frappe.db.exists("Appointment Records", {
            "doctor": self.doctor,
            "appointment_date": self.appointment_date,
            "from_time": self.from_time,
            "appointment_status": ["not in", ["Cancelled"]],
            "name": ["!=", self.name]
        })
        if conflict:
            frappe.throw(
                f"This time slot is already booked for Dr. {self.doctor_name}. "
                f"Please choose a different slot."
            )

    def set_consultation_fee(self):
        if self.doctor_schedule and not self.consultation_fee:
            fee = frappe.db.get_value(
                "Doctor Shedules", 
                self.doctor_schedule,
                "consultation_fee"
            )
            if fee:
                self.consultation_fee = fee

    def on_submit(self):
        self.appointment_status = "Confirmed"
        self.db_set("appointment_status", "Confirmed")
        # self.send_confirmation_email()

    def send_confirmation_email(self):
        if self.patient:
            patient_email = frappe.db.get_value(
                "Patient Details",
                self.patient,
                "email"
            )
            if patient_email:
                frappe.sendmail(
                    recipients=[patient_email],
                    subject=f"Appointment Confirmed — {self.name}",
                    message=f"""
                        Dear {self.patient_name},<br><br>
                        Your appointment has been confirmed.<br>
                        <b>Doctor:</b> {self.doctor_name}<br>
                        <b>Date:</b> {self.appointment_date}<br>
                        <b>Time:</b> {self.from_time}<br>
                        <b>Reference:</b> {self.name}<br><br>
                        Thank you.
                    """
                )

    def on_cancel(self):
        self.appointment_status = "Cancelled"
        self.db_set("appointment_status", "Cancelled")
        self.restore_slot()

    def restore_slot(self):
        schedule = frappe.get_doc("Doctor Shedules", self.doctor_schedule)
        schedule.available_slots = (schedule.available_slots or 0) + 1
        schedule.save(ignore_permissions=True)