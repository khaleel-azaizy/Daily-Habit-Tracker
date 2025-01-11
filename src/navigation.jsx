import { NavLink ,Outlet} from "react-router-dom"
import '@fortawesome/fontawesome-free/css/all.min.css';

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
            <i class="fa fa-sign-out" aria-hidden="true"></i>
            </button>
            
        
            <nav className="nav-links">
            <div className="center-links">
                <NavLink to="/home">Calendar</NavLink>
                <NavLink to="/user-notes">User Notes</NavLink>
            </div>
            
            </nav>
            </div>
        </header>
        <main>
            <Outlet/>
        </main>
    </div>
)
}