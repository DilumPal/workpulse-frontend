import { useState, useEffect, useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

const formatError = (err, fallback) => {
  const raw = err.response?.data?.details || err.response?.data?.message || fallback;
  if (typeof raw === "object" && raw !== null) {
    return Object.values(raw).join(", ");
  }
  return String(raw);
};

export default function ManageEmployees() {
  const { user } = useContext(AuthContext);
  const { profile } = useOutletContext() || {};
  const isAdmin = (user?.role || "").toUpperCase().includes("ADMIN");

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    jobRole: "",
    salary: "",
    empType: "Full time",
    departmentId: "",
    role: "Employee",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, deptRes] = await Promise.all([
        api.get("/employees"),
        api.get("/departments"),
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
      setError("");
    } catch (err) {
      setError(formatError(err, "Failed to load employees or departments."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingEmp(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
      jobRole: "",
      salary: "",
      empType: "Full time",
      departmentId: departments[0]?.departmentId || departments[0]?.id || "",
      role: "Employee",
    });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingEmp(emp);
    const matchedDept = departments.find(
      (d) =>
        d.name === emp.departmentName ||
        (d.departmentId || d.id) === emp.departmentId,
    );

    setFormData({
      firstName: emp.firstName || "",
      lastName: emp.lastName || "",
      email: emp.email || "",
      password: "", // Leave blank when editing
      phoneNumber: emp.phoneNumber || "",
      jobRole: emp.jobRole || "",
      salary: emp.salary || "",
      empType: emp.empType || "Full time",
      departmentId: matchedDept
        ? matchedDept.departmentId || matchedDept.id
        : "",
      role: emp.role || "Employee",
    });
    setError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmp(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const payload = {
      ...formData,
      salary: parseFloat(formData.salary),
      departmentId: parseInt(formData.departmentId, 10),
    };

    // HR Managers cannot change access levels
    if (!isAdmin) {
      payload.role = editingEmp ? editingEmp.role : "Employee";
    }

    try {
      if (editingEmp) {
        const id = editingEmp.employeeId || editingEmp.id;
        const response = await api.put(`/employees/${id}`, payload);
        setEmployees((prev) =>
          prev.map((emp) =>
            (emp.employeeId || emp.id) === id ? response.data : emp,
          ),
        );
        setSuccessMessage(
          `Employee "${formData.firstName} ${formData.lastName}" updated.`,
        );
      } else {
        const response = await api.post("/employees", payload);
        setEmployees((prev) => [...prev, response.data]);
        setSuccessMessage(
          `Employee "${formData.firstName} ${formData.lastName}" created.`,
        );
      }
      closeModal();
    } catch (err) {
      setError(formatError(err, "Failed to save employee."));
    }
  };

  const handleDelete = async (emp) => {
    const id = emp.employeeId || emp.id;
    if (!window.confirm(`Delete employee "${emp.firstName} ${emp.lastName}"?`))
      return;

    setError("");
    setSuccessMessage("");
    try {
      await api.delete(`/employees/${id}`);
      setEmployees((prev) => prev.filter((e) => (e.employeeId || e.id) !== id));
      setSuccessMessage(`Employee "${emp.firstName} ${emp.lastName}" deleted.`);
    } catch (err) {
      setError(formatError(err, "Failed to delete employee."));
    }
  };

  const currentEmail = user?.email?.toLowerCase();
  const currentEmployeeId = profile?.employeeId || profile?.id;

  const filteredEmployees = employees.filter((emp) => {
    const empId = emp.employeeId || emp.id;
    const empEmail = (emp.email || "").toLowerCase();

    // Hide the currently logged-in Admin or HR Manager from the list
    if (currentEmployeeId && empId === currentEmployeeId) return false;
    if (currentEmail && empEmail === currentEmail) return false;

    const query = searchQuery.toLowerCase();
    return (
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(query) ||
      empEmail.includes(query) ||
      (emp.jobRole || "").toLowerCase().includes(query) ||
      (emp.departmentName || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Manage Employees</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by name, email, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={openCreateModal}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm whitespace-nowrap"
          >
            + Add Employee
          </button>
        </div>
      </div>

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

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading employees...
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No employees found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b text-xs uppercase text-gray-500 font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Job Role</th>
                  <th className="py-3 px-4">Access Level</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredEmployees.map((emp) => {
                  const id = emp.employeeId || emp.id;
                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 font-semibold text-gray-900">
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td className="py-4 px-4 text-gray-600">{emp.email}</td>
                      <td className="py-4 px-4 text-gray-700">
                        {emp.departmentName || "Unassigned"}
                      </td>
                      <td className="py-4 px-4 text-gray-700">{emp.jobRole}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                          {(emp.role || "Employee").replace("ROLE_", "")}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 my-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingEmp ? "Edit Employee" : "Add New Employee"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                {!editingEmp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password (min 8 chars)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (10 digits)
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    title="Phone number must be exactly 10 digits (numbers only, no spaces)"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phoneNumber: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Role
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.jobRole}
                    onChange={(e) =>
                      setFormData({ ...formData, jobRole: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={formData.salary}
                    onChange={(e) =>
                      setFormData({ ...formData, salary: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Type
                  </label>
                  <select
                    value={formData.empType}
                    onChange={(e) =>
                      setFormData({ ...formData, empType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                  >
                    <option value="Full time">Full time</option>
                    <option value="Part time">Part time</option>
                    <option value="Contractor">Contractor</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    required
                    value={formData.departmentId}
                    onChange={(e) =>
                      setFormData({ ...formData, departmentId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option
                        key={d.departmentId || d.id}
                        value={d.departmentId || d.id}
                      >
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Level{" "}
                    {!isAdmin && (
                      <span className="text-xs text-gray-400">
                        (Admin only)
                      </span>
                    )}
                  </label>
                  <select
                    disabled={!isAdmin}
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      isAdmin
                        ? "bg-white border-gray-300"
                        : "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                    }`}
                  >
                    <option value="Employee">Employee</option>
                    <option value="HR Manager">HR Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editingEmp ? "Save Changes" : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}