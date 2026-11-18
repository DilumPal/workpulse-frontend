import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<div className="p-10 text-xl font-bold">Login Page</div>} />

      {/* Private Dashboard Routes */}
      <Route path="/dashboard" element={<div className="p-10 text-xl font-bold text-blue-600">Employee Dashboard</div>} />
      
      {/* Default fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;