# Copyright (c) 2026, paul and contributors
# For license information, please see license.txt

# import frappe

import frappe


def execute(filters=None):
    columns = get_columns()
    data = get_data(filters)
    return columns, data


def get_columns():
    return [
        {
            "label": "Appointment ID",
            "fieldname": "name",
            "fieldtype": "Link",
            "options": "Appointments Records",
            "width": 160
        },
        {
            "label": "Patient Name",
            "fieldname": "patient_name",
            "fieldtype": "Data",
            "width": 150
        },
        {
            "label": "Mobile No",
            "fieldname": "mobile_no",
            "fieldtype": "Data",
            "width": 110
        },
        {
            "label": "Doctor Name",
            "fieldname": "doctor_name",
            "fieldtype": "Data",
            "width": 150
        },
        {
            "label": "Appointment Date",
            "fieldname": "appointment_date",
            "fieldtype": "Date",
            "width": 120
        },
        {
            "label": "From Time",
            "fieldname": "from_time",
            "fieldtype": "Time",
            "width": 90
        },
        {
            "label": "To Time",
            "fieldname": "to_time",
            "fieldtype": "Time",
            "width": 90
        },
        {
            "label": "Status",
            "fieldname": "appointment_status",
            "fieldtype": "Data",
            "width": 100
        },
        {
            "label": "Consultation Fee",
            "fieldname": "consultation_fee",
            "fieldtype": "Currency",
            "width": 120
        },
        {
            "label": "Amount Paid",
            "fieldname": "amount_paid",
            "fieldtype": "Currency",
            "width": 110
        },
        {
            "label": "Payment Status",
            "fieldname": "payment_status",
            "fieldtype": "Data",
            "width": 110
        },
        {
            "label": "Blood Group",
            "fieldname": "blood_group",
            "fieldtype": "Data",
            "width": 90
        },
    ]


def get_data(filters):
    conditions = get_conditions(filters)

    return frappe.db.sql("""
        SELECT
            ar.name,
            ar.patient_name,
            pd.mobile_no,
            ar.doctor_name,
            ar.appointment_date,
            ar.from_time,
            ar.to_time,
            ar.appointment_status,
            ar.consultation_fee,
            ar.amount_paid,
            ar.payment_status
         
        FROM
            `tabAppointments Records` ar
        LEFT JOIN
            `tabPatient Details` pd ON pd.name = ar.patient
        WHERE
            1=1 {conditions}
        ORDER BY
            ar.appointment_date DESC,
            ar.from_time ASC
    """.format(conditions=conditions), filters, as_dict=True)


def get_conditions(filters):
    conditions = ""

    if not filters:
        return conditions

    if filters.get("from_date"):
        conditions += " AND ar.appointment_date >= %(from_date)s"

    if filters.get("to_date"):
        conditions += " AND ar.appointment_date <= %(to_date)s"

    if filters.get("doctor"):
        conditions += " AND ar.doctor = %(doctor)s"

    if filters.get("patient"):
        conditions += " AND ar.patient = %(patient)s"

    if filters.get("appointment_status"):
        conditions += " AND ar.appointment_status = %(appointment_status)s"

    if filters.get("payment_status"):
        conditions += " AND ar.payment_status = %(payment_status)s"

    return conditions