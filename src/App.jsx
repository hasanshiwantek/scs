import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TokenPage from './pages/TokenPage';
import OrdersPage from './pages/OrdersPage';
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TokenPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
