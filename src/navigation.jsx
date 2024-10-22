import { NavLink ,Outlet} from "react-router-dom"

export default function navigation(){
return(
    <div className="navigation">
        
        <header>
            <nav>
            <h1>Daily Habits</h1>
            <NavLink to="/home">Home</NavLink>
            <NavLink to="/personal-habits">User Habits</NavLink>
            </nav>
        
        </header>
        <main>
            <Outlet/>
        </main>
    </div>
)
}