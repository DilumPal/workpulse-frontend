import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function StaffDirectory() {
    const [directory, setDirectory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    useEffect(() => {
        const fetchDirectory = async () => {
            try {
                const response = await api.get('/employees');
                const activeEmployees = response.data.map(emp => ({
                    id: emp.employeeId || emp.id,
                    firstName: emp.firstName || '',
                    lastName: emp.lastName || '',
                    name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
                    jobRole: emp.jobRole || 'Unassigned',
                    departmentName: emp.departmentName || emp.department?.name || 'Unassigned',
                    email: emp.email || '',
                    phoneNumber: emp.phoneNumber || '',
                    empType: emp.empType || emp.employmentType || 'Full time',
                    profilePhotoUrl: emp.profilePhotoUrl || null
                }));
                setDirectory(activeEmployees);
            } catch (err) {
                setError("Could not load staff directory.");
            }
        };
        fetchDirectory();
    }, []);

    const filteredDirectory = directory.filter(emp => 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.jobRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Staff Directory</h2>
            
            {error && <div className="p-4 text-red-700 bg-red-100 rounded-md font-medium">{error}</div>}

            <div className="p-6 bg-white rounded-lg shadow-sm">
                <input 
                    type="text" 
                    placeholder="Search Employee by name, role, or department..." 
                    className="w-full px-4 py-3 mb-6 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDirectory.map((emp) => (
                        <div key={emp.id} className="flex justify-between items-center p-4 border rounded-md hover:bg-gray-50">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center text-gray-600 font-bold text-lg flex-shrink-0">
                                    {emp.profilePhotoUrl ? (
                                        <img
                                            src={emp.profilePhotoUrl}
                                            alt={emp.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        emp.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-base">{emp.name}</p>
                                    <p className="text-sm text-gray-500">{emp.jobRole}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedEmployee(emp)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Contact &rarr;
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Info Modal */}
            {selectedEmployee && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
                    onClick={() => setSelectedEmployee(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedEmployee(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
                            aria-label="Close"
                        >
                            &times;
                        </button>

                        {/* Avatar & Name */}
                        <div className="flex flex-col items-center text-center pb-5 border-b">
                            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md flex items-center justify-center mb-3">
                                {selectedEmployee.profilePhotoUrl ? (
                                    <img
                                        src={selectedEmployee.profilePhotoUrl}
                                        alt={selectedEmployee.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-gray-500 uppercase">
                                        {selectedEmployee.name.charAt(0) || 'U'}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{selectedEmployee.name}</h3>
                            <p className="text-sm font-medium text-blue-600 mt-0.5">{selectedEmployee.jobRole}</p>
                            <p className="text-xs text-gray-500 mt-1">{selectedEmployee.departmentName}</p>
                        </div>

                        {/* Non-Sensitive Contact Details */}
                        <div className="py-5 space-y-3 text-sm">
                            <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md">
                                <span className="text-gray-500 font-medium">Email</span>
                                {selectedEmployee.email ? (
                                    <a
                                        href={`mailto:${selectedEmployee.email}`}
                                        className="text-blue-600 hover:underline font-medium truncate ml-4"
                                    >
                                        {selectedEmployee.email}
                                    </a>
                                ) : (
                                    <span className="text-gray-400">Not available</span>
                                )}
                            </div>

                            <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md">
                                <span className="text-gray-500 font-medium">Phone</span>
                                {selectedEmployee.phoneNumber ? (
                                    <a
                                        href={`tel:${selectedEmployee.phoneNumber}`}
                                        className="text-gray-900 hover:text-blue-600 font-medium"
                                    >
                                        {selectedEmployee.phoneNumber}
                                    </a>
                                ) : (
                                    <span className="text-gray-400">Not available</span>
                                )}
                            </div>

                            <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md">
                                <span className="text-gray-500 font-medium">Employment Type</span>
                                <span className="text-gray-900 font-medium">{selectedEmployee.empType}</span>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedEmployee(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}