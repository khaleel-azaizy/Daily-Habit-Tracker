import { useState } from "react";
import { Link, useNavigate  } from "react-router-dom";
import {useAuth } from "../components/AuthProvider"


export default function Register(){
    const [email,setEmail]= useState('');
    const [password,setPassword]= useState('');
    const [name,setName]= useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState(''); 

    const handleSubmit=(e)=>{
        e.preventDefault();
        const user = {name,email,password};
        fetch('http://localhost:4000/register',{
            method:'post', 
            headers:{"Content-Type": "application/json"},
            body:JSON.stringify(user)
        }).then(response => {
            if (response.ok) {
                console.log('register successful');
                return response.json();  
            } else {
                throw new Error('email is already used');
            }
        }).then(data => {
           
            login(); 
            navigate('/home'); 
        })
         .catch(err =>{
            console.error(err);
            setError(err.message)

         })
    }
    
    return(
        <div className="login">
            <div className="blod"></div>
            <h2>Welcome to Daily Habit</h2>
           
             <form onSubmit={handleSubmit}>
                 <label> User Email</label>
                <input type="text" required value={email}  onChange={(e)=>setEmail(e.target.value)}/> 
                <label> User Name</label>
                <input type="text" required value={name}  onChange={(e)=>setName(e.target.value)}/> 
                <label> Password</label>
                <input type="text" required value={password}  onChange={(e)=>setPassword(e.target.value)}/> 
                <button >Register</button>
                {error && <p style={{ color: 'red' ,textAlign:'center'}}>{error}</p>}
             </form>
             <div className="login-her">
             <h4>Already have an acount </h4>
             <Link to="/login">Login her!</Link>
             </div>
             
        </div>
    )
    }


  