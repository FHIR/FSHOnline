import React from 'react';
import { Route, Routes } from 'react-router-dom';
import App from './App';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/share/:id" element={<App path="share" />} />
      <Route path="/gist/:id" element={<App path="gist" />} />
      <Route path="/*" element={<App />} />
    </Routes>
  );
}
