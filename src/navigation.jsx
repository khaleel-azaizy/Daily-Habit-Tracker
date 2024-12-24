import { NavLink ,Outlet} from "react-router-dom"

export default function navigation(){
    const logout = () => {
        localStorage.clear(); 
        window.location.href = '/login';
      };

return(
    <div className="navigation">
        
        <header>
            <div className="header">
            <h1>Daily Habits</h1>
            <button className="logout" onClick={logout}>
                LogOut
            </button>
            </div>
        
            <nav className="nav-links">
            <div className="center-links">
                <NavLink to="/home">Calendar</NavLink>
                <NavLink to="/user-notes">User Notes</NavLink>
            </div>
            
            </nav>
        
        </header>
        <main>
            <Outlet/>
        </main>
    </div>
)
}