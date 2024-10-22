import { useState } from "react";
import { useNavigate,Link  } from "react-router-dom";
import {useAuth } from "../components/AuthProvider"
export default function Login(){
    const [email,setEmail]= useState('');
    const [password,setPassword]= useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState(''); 

    const handleSubmit=(e)=>{
        e.preventDefault();
        const user = {email,password};
        fetch('http://localhost:4000/login',{
            method:'post', 
            headers:{"Content-Type": "application/json"},
            body:JSON.stringify(user)
        }).then(response => {
            if (response.ok) {
                console.log('Login successful');
                return response.json();  
            } else {
                throw new Error('email or password is incorrect');
            }
        }).then(data => {
           
            login(); 
            navigate('/home'); 
        })
         .catch(err =>{
            console.error(err);
            setError(err.message);

         })
    }
    
    return(
        <div className="login">
            <h2>Welcome to Daily Habit</h2>
           
             <form onSubmit={handleSubmit}>
                <label> User Email</label>
                <input type="text" required value={email}  onChange={(e)=>setEmail(e.target.value)}/> 
                <label> Password</label>
                <input type="text" required value={password}  onChange={(e)=>setPassword(e.target.value)}/> 
                <button >Login</button>
                {error && <p style={{ color: 'red' ,textAlign:'center'}}>{error}</p>}
             </form>
            
             <div className="regestir-her">
             <h4>You dont have an acount </h4>
             <Link to="/register">Register her!</Link>
             </div>
            
        </div>
    )
    }


  