import { NavLink ,Outlet} from "react-router-dom"

export default function navigation(){
    const logout = () => {
        localStorage.clear(); 
        window.location.href = '/login';
      };

return(
    <div className="navigation">
        
        <header>
            <nav>
            <h1>Daily Habits</h1>
            <NavLink to="/home">Calendar</NavLink>
            <NavLink to="/personal-habits">User Habits</NavLink>
            <button className={"logout"} onClick={logout}>LogOut</button>
            </nav>
        
        </header>
        <main>
            <Outlet/>
        </main>
    </div>
)
}