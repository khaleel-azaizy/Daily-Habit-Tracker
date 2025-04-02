import { NavLink, Outlet } from "react-router-dom";
import { useState, useCallback } from "react";
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Navigation() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const logout = useCallback(() => {
        fetch('http://localhost:4000/logout', {
            method: 'POST',
            credentials: 'include',
        })
        .then(() => {
            localStorage.clear();
            window.location.href = '/login';
        })
        .catch((err) => {
            console.error('Logout error:', err);
            alert('Failed to log out. Please try again.');
        });
    }, []);

    const toggleSidebar = useCallback(() => {
        setSidebarOpen((prev) => !prev);
    }, []);

    const closeSidebar = useCallback(() => {
        setSidebarOpen(false);
    }, []);

    return (
        <div className="navigation-container">
            <div className="navigation-header">
                <button
                    className={!sidebarOpen ? "sidebar-toggle-button" : "sidebar-toggle-button-open"}
                    onClick={toggleSidebar}
                    aria-label="Toggle Sidebar"
                >
                    <i className="fa fa-bars" aria-hidden="true"></i>
                </button>
            </div>

            {sidebarOpen && (
                <aside className="navigation-sidebar">
                    <nav className="nav-links">
                        <NavLink
                            to="/home"
                            className="nav-link"
                            aria-label="Go to Calendar"
                            onClick={closeSidebar}
                        >
                            Calendar
                        </NavLink>
                        <NavLink
                            to="/user-notes"
                            className="nav-link"
                            aria-label="Go to User Notes"
                            onClick={closeSidebar}
                        >
                            User Notes
                        </NavLink>
                    </nav>
                    <button
                        className="logout"
                        onClick={logout}
                        aria-label="Log Out"
                    >
                        <i className="fa fa-sign-out" aria-hidden="true"></i>
                    </button>
                </aside>
            )}

            <div className="main-content">
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
