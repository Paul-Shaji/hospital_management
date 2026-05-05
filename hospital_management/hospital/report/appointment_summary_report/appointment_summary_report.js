// Copyright (c) 2026, paul and contributors
// For license information, please see license.txt
frappe.query_reports["Appointment Summary Report"] = {
	filters: [
			{
					fieldname: "from_date",
					label: __("From Date"),
					fieldtype: "Date",
					default: frappe.datetime.month_start()
			},
			{
					fieldname: "to_date",
					label: __("To Date"),
					fieldtype: "Date",
					default: frappe.datetime.month_end()
			},
			{
					fieldname: "doctor",
					label: __("Doctor"),
					fieldtype: "Link",
					options: "Doctor"
			},
			{
					fieldname: "patient",
					label: __("Patient"),
					fieldtype: "Link",
					options: "Patient Details"
			},
			{
					fieldname: "appointment_status",
					label: __("Appointment Status"),
					fieldtype: "Select",
					options: "\nDraft\nBooked\nConfirmed\nCompleted\nCancelled\nNo-Show"
			},
			{
					fieldname: "payment_status",
					label: __("Payment Status"),
					fieldtype: "Select",
					options: "\nUnpaid\nPaid\nWaived\nRefunded"
			}
	]
};