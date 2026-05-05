# Copyright (c) 2026, paul and contributors
# For license information, please see license.txt

# import frappe
# patient_details.py

import frappe
from frappe.model.document import Document
from frappe.utils import today, date_diff


class PatientDetails(Document):
    pass   # class stays empty, logic moved to standalone functions


# ── Standalone functions referenced by hooks.py ──────────

def before_insert(doc, method=None):
    if not doc.registration_date:
        doc.registration_date = today()


def validate(doc, method=None):
    calculate_age(doc)
    validate_mobile(doc)


def after_insert(doc, method=None):
    pass   # add portal user creation here later


def calculate_age(doc):
    if doc.date_of_birth:
        age_days = date_diff(today(), doc.date_of_birth)
        doc.age = int(age_days / 365)


def validate_mobile(doc):
    if doc.mobile_no:
        digits = ''.join(filter(str.isdigit, doc.mobile_no))
        if len(digits) < 10:
            frappe.throw("Mobile number must have at least 10 digits")