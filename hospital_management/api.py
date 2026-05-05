import frappe
from frappe.utils import today


@frappe.whitelist(allow_guest=True)
def get_doctors():
    doctors = frappe.get_list(
        "Doctor",
        filters={"is_active": 1},
        fields=["name", "doctor_name", "specialization", "consultation_fee"]
    )
    return doctors

@frappe.whitelist(allow_guest=True)
def get_available_slots(doctor, appointment_date):
    schedules = frappe.get_list(
        "Doctor Shedules", 
        filters={
            "doctor": doctor,
            "schedule_status": "active"
        },
        fields=[
            "name",
            "from_time",
            "to_time",
            "slot_durationmins",
            "consultation_fee",
            "available_slots",
            "day_of_week"
        ],
        ignore_permissions=True
    )

    booked = frappe.get_list(
        "Appointments Records",
        filters={
            "doctor": doctor,
            "appointment_date": appointment_date,
            "appointment_status": ["not in", ["Cancelled"]]
        },
        fields=["from_time"],
        ignore_permissions=True
    )

    booked_times = [str(b.from_time) for b in booked]

    available = []
    for schedule in schedules:
        if not schedule.slot_durationmins:
            continue
        slots = generate_slots(
            schedule.from_time,
            schedule.to_time,
            schedule.slot_durationmins
        )
        for slot in slots:
            if slot not in booked_times:
                available.append({
                    "schedule": schedule.name,
                    "from_time": slot,
                    "consultation_fee": schedule.consultation_fee
                })

    return available


def generate_slots(from_time, to_time, duration_mins):
    from datetime import datetime, timedelta
    slots = []
    fmt = "%H:%M:%S"
    try:
        current = datetime.strptime(str(from_time), fmt)
        end = datetime.strptime(str(to_time), fmt)
        while current < end:
            slots.append(current.strftime(fmt))
            current += timedelta(minutes=int(duration_mins))
    except Exception as e:
        frappe.log_error(str(e), "generate_slots error")
    return slots


@frappe.whitelist()
def get_patient_details():
    patient = frappe.db.get_value(
        "Patient Details",
        {"portal_user": frappe.session.user},
        [
            "name",
            "patient_full_name",
            "mobile_no",
            "blood_group",
            "date_of_birth",
            "gender"
        ],
        as_dict=True
    )
    return patient


@frappe.whitelist()
def book_appointment(
    doctor,
    doctor_schedule,
    appointment_date,
    from_time,
    appointment_type="new",
    symptoms_notes=None
):
    patient = frappe.db.get_value(
        "Patient Details",
        {"portal_user": frappe.session.user},
        ["name", "patient_full_name"],
        as_dict=True
    )

    if not patient:
        frappe.throw("No patient record found. Please register first.")

    doctor_doc = frappe.get_doc("Doctor", doctor)
    schedule_doc = frappe.get_doc("Doctor Shedules", doctor_schedule) 

    from datetime import datetime, timedelta
    fmt = "%H:%M:%S"
    from_dt = datetime.strptime(str(from_time), fmt)
    to_dt = from_dt + timedelta(
        minutes=int(schedule_doc.slot_durationmins or 15)
    )
    to_time = to_dt.strftime(fmt)

    appointment = frappe.get_doc({
        "doctype": "Appointments Records",
        "naming_series": "APT-.YYYY.-.#####",
        "patient": patient.name,
        "patient_name": patient.patient_full_name,
        "doctor": doctor,
        "doctor_name": doctor_doc.doctor_name,
        "doctor_schedule": doctor_schedule,
        "appointment_date": appointment_date,
        "from_time": from_time,
        "to_time": to_time,
        "appointment_type": appointment_type,
        "appointment_status": "Booked",
        "payment_status": "Unpaid",
        "consultation_fee": schedule_doc.consultation_fee,
        "symptoms_notes": symptoms_notes or ""
    })

    appointment.insert(ignore_permissions=True)
    frappe.db.commit()

    return {
        "success": True,
        "appointment": appointment.name,
        "fee": schedule_doc.consultation_fee
    }

@frappe.whitelist()
def get_my_appointments():
    try:
        if frappe.session.user == "Guest":
            return []

        patient = frappe.db.get_value(
            "Patient Details",
            {"portal_user": frappe.session.user},
            "name"
        )

        if not patient:
            return []

        appointments = frappe.get_list(
            "Appointments Records",
            filters={"patient": patient},
            fields=[
                "name",
                "doctor_name",
                "appointment_date",
                "from_time",
                "to_time",
                "appointment_status",
                "payment_status",
                "consultation_fee",
                "appointment_type"
            ],
            order_by="appointment_date desc",
            ignore_permissions=True
        )

        return appointments

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "get_my_appointments error")
        return []


@frappe.whitelist()
def cancel_appointment(name):
    patient = frappe.db.get_value(
        "Patient Details",
        {"portal_user": frappe.session.user},
        "name"
    )

    appointment = frappe.get_doc("Appointments Records", name)

    if appointment.patient != patient:
        frappe.throw("You are not authorised to cancel this appointment.")

    appointment.cancel()
    frappe.db.commit()

    return {"success": True}


@frappe.whitelist(allow_guest=True)
def register_patient(
    patient_full_name,
    date_of_birth,
    gender,
    mobile_no,
    email,
    password,
    blood_group=None,
    address=None
):
    if frappe.db.exists("Patient Details", {"email": email}):
        frappe.throw("This email is already registered. Please login.")

    if frappe.db.exists("User", email):
        frappe.throw("An account with this email already exists.")

    name_parts = patient_full_name.strip().split(' ')
    first_name = name_parts[0]
    last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''

    user = frappe.get_doc({
        "doctype": "User",
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "full_name": patient_full_name,
        "user_type": "Website User",
        "new_password": password,
        "send_welcome_email": 0
    })
    user.insert(ignore_permissions=True)

    patient = frappe.get_doc({
        "doctype": "Patient Details",
        "naming_series": "PAT-.YYYY.-.#####",
        "patient_full_name": patient_full_name,
        "date_of_birth": date_of_birth,
        "gender": gender,
        "mobile_no": mobile_no,
        "email": email,
        "blood_group": blood_group or "",
        "address": address or "",
        "patient_status": "active",
        "portal_user": email
    })
    patient.insert(ignore_permissions=True)
    frappe.db.commit()

    return {"success": True, "patient": patient.name}