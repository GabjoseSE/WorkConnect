import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export default function AdminLayout() {
  const layoutStyle = {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Segoe UI, sans-serif',
    backgroundColor: '#f4f6f8',
  };

  const sidebarStyle = {
    width: '240px',
    backgroundColor: '#1f2937',
    color: '#fff',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  };

  const linkBaseStyle = {
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    padding: '8px 0',
  };

  const contentStyle = {
    flex: 1,
    padding: '32px',
  };

  return (
    <div style={layoutStyle}>
      <aside style={sidebarStyle}>
        <h2>Admin Panel</h2>
        <NavLink
          to="/admin"
          style={({ isActive }) => ({
            ...linkBaseStyle,
            color: isActive ? '#60a5fa' : '#fff',
          })}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/users"
          style={({ isActive }) => ({
            ...linkBaseStyle,
            color: isActive ? '#60a5fa' : '#fff',
          })}
        >
          User Management
        </NavLink>
        <NavLink
          to="/admin/jobs"
          style={({ isActive }) => ({
            ...linkBaseStyle,
            color: isActive ? '#60a5fa' : '#fff',
          })}
        >
          Job Approvals
        </NavLink>
        <NavLink
          to="/admin/reports"
          style={({ isActive }) => ({
            ...linkBaseStyle,
            color: isActive ? '#60a5fa' : '#fff',
          })}
        >
          Reports
        </NavLink>
        <NavLink
          to="/admin/analytics"
          style={({ isActive }) => ({
            ...linkBaseStyle,
            color: isActive ? '#60a5fa' : '#fff',
          })}
        >
          Analytics
        </NavLink>
      </aside>

      <main style={contentStyle}>
        <Outlet />
      </main>
    </div>
  );
}
