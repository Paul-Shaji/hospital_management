# Copyright (c) 2026, paul and contributors
# For license information, please see license.txt

# import frappe
# doctor_schedules/doctor_schedules.py

import frappe
from frappe.model.document import Document
from datetime import datetime

class DoctorShedules(Document):

    def validate(self):
        self.validate_times()
        self.calculate_available_slots()

    def validate_times(self):
        if self.from_time and self.to_time:
            if self.from_time >= self.to_time:
                frappe.throw("From time must be earlier than To time")

    def calculate_available_slots(self):
        if self.from_time and self.to_time and self.slot_duration_mins:
            fmt = "%H:%M:%S"
            start = datetime.strptime(str(self.from_time), fmt)
            end = datetime.strptime(str(self.to_time), fmt)
            total_minutes = (end - start).seconds // 60
            self.available_slots = total_minutes // self.slot_duration_mins
            self.max_patients = self.available_slots