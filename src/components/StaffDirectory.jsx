import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function StaffDirectory() {
    const [directory, setDirectory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDirectory = async () => {
            try {
                const response = await api.get('/employees');
                const activeEmployees = response.data.map(emp => ({
                    id: emp.id,
                    name: `${emp.firstName} ${emp.lastName}`,
                    jobRole: emp.jobRole || 'Unassigned' 
                }));
                setDirectory(activeEmployees);
            } catch (err) {
                setError("Could not load staff directory.");
            }
        };
        fetchDirectory();
    }, []);

    const filteredDirectory = directory.filter(emp => 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Staff Directory</h2>
            
            {error && <div className="p-4 text-red-700 bg-red-100 rounded-md font-medium">{error}</div>}

            <div className="p-6 bg-white rounded-lg shadow-sm">
                <input 
                    type="text" 
                    placeholder="Search Employee..." 
                    className="w-full px-4 py-3 mb-6 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDirectory.map((emp) => (
                        <div key={emp.id} className="flex justify-between items-center p-4 border rounded-md hover:bg-gray-50">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg">
                                    {emp.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-base">{emp.name}</p>
                                    <p className="text-sm text-gray-500">{emp.jobRole}</p>
                                </div>
                            </div>
                            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Contact &rarr;</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}