import { NavLink ,Outlet} from "react-router-dom"
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function navigation(){
    const logout = () => {
        fetch('http://localhost:4000/logout', {
            method: 'POST',
            credentials: 'include',
          })
         .then(() => {
                localStorage.clear(); 
               window.location.href = '/login';
                
            })
            .catch((err) => console.error('Logout error:', err));
       
      };

return(
    <div className="navigation">
        
        <header>
            <div className="header">
            <h1>Daily Habits</h1>
            <button className="logout" onClick={logout}>
            <i className="fa fa-sign-out" aria-hidden="true"></i>
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