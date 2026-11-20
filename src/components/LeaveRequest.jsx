import { useState } from "react";
import api from "../api/axios";

const getDatesInRange = (startStr, endStr) => {
  if (!startStr || !endStr || endStr < startStr) return [];
  const dates = [];
  const [sY, sM, sD] = startStr.split("-").map(Number);
  const [eY, eM, eD] = endStr.split("-").map(Number);
  const current = new Date(sY, sM - 1, sD);
  const end = new Date(eY, eM - 1, eD);

  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

export default function LeaveRequest() {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Annual Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Maps each date string ("YYYY-MM-DD") to 1 (Full Day) or 0.5 (Half Day)
  const [dayDurations, setDayDurations] = useState({});

  const hasBothDates = Boolean(leaveForm.startDate && leaveForm.endDate);
  const isInvalidRange = hasBothDates && leaveForm.endDate < leaveForm.startDate;
  const datesInRange = getDatesInRange(leaveForm.startDate, leaveForm.endDate);

  const totalDays = datesInRange.reduce(
    (sum, date) => sum + (dayDurations[date] ?? 1),
    0
  );

  const handleDateChange = (field, value) => {
    setLeaveForm((prev) => ({ ...prev, [field]: value }));
  };

  const setDurationForDate = (date, value) => {
    setDayDurations((prev) => ({ ...prev, [date]: value }));
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (isInvalidRange) {
      setError("End date cannot be before start date.");
      return;
    }

    const payload = {
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      requestedDuration: totalDays,
      reason: leaveForm.reason,
    };

    try {
      await api.post("/leave-requests", payload);
      setSuccessMessage(
        `Leave request submitted successfully (${totalDays} ${totalDays === 1 ? "day" : "days"})!`
      );
      setLeaveForm({
        leaveType: "Annual Leave",
        startDate: "",
        endDate: "",
        reason: "",
      });
      setDayDurations({});
    } catch (err) {
      const rawError =
        err.response?.data?.details ||
        err.response?.data?.message ||
        "Failed to submit leave request.";
      const errorMessage =
        typeof rawError === "object" && rawError !== null
          ? Object.values(rawError).join(", ")
          : String(rawError);
      setError(errorMessage);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Leave Request</h2>

      {error && (
        <div className="p-4 text-red-700 bg-red-100 rounded-md font-medium">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="p-4 text-green-700 bg-green-100 rounded-md font-medium">
          {successMessage}
        </div>
      )}

      <div className="p-8 bg-white rounded-lg shadow-sm">
        <form onSubmit={handleLeaveSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <select
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={leaveForm.leaveType}
              onChange={(e) =>
                setLeaveForm({ ...leaveForm, leaveType: e.target.value })
              }
            >
              <option value="Annual Leave">Annual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={leaveForm.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                min={leaveForm.startDate || undefined}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={leaveForm.endDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
              />
            </div>
          </div>

          {/* Per-Day Duration Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Duration
              </label>
              {totalDays > 0 && (
                <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full">
                  Total: {totalDays} {totalDays === 1 ? "Day" : "Days"}
                </span>
              )}
            </div>

            {isInvalidRange ? (
              <p className="text-sm text-red-600">
                End date must be on or after the start date.
              </p>
            ) : datesInRange.length === 0 ? (
              <p className="text-sm text-gray-400">
                Select a start and end date to configure daily duration.
              </p>
            ) : (
              <div className="border rounded-md divide-y max-h-60 overflow-y-auto bg-gray-50">
                {datesInRange.map((date) => {
                  const value = dayDurations[date] ?? 1;
                  return (
                    <div
                      key={date}
                      className="flex items-center justify-between px-4 py-2.5 bg-white"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {date}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setDurationForDate(date, 1)}
                          className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                            value === 1
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Full Day
                        </button>
                        <button
                          type="button"
                          onClick={() => setDurationForDate(date, 0.5)}
                          className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                            value === 0.5
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Half Day
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              required
              rows="4"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              value={leaveForm.reason}
              onChange={(e) =>
                setLeaveForm({ ...leaveForm, reason: e.target.value })
              }
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isInvalidRange || totalDays === 0}
            className="w-full px-4 py-3 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Leave Request
          </button>
        </form>
      </div>
    </div>
  );
}