import { useState } from "react";
import { useNavigate,Link  } from "react-router-dom";
import {useAuth } from "../components/AuthProvider"



export default function Login(){
    const [email,setEmail]= useState('');
    const [password,setPassword]= useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState(''); 
    

    const handleSubmit =  (e) => {
        e.preventDefault();
        
            const user = {email,password};
         fetch('http://localhost:4000/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
          })
          .then((response) => {
            if(!response.ok){
                throw new Error("email or password are incorrect");
                
            }
           return response.json()
          })
        
          .then((data) => {
            const userId = data.userid;
            localStorage.setItem('userId', userId);
            console.log('User logged in successfully',userId);
            login(); 
            navigate('/home'); 
          })

           
          
         .catch ((error)=> {
          console.error('Error during login:', error);
          setError(error.message);

         })
      };

    
    
    return(
        <div className="login">
          <div className="blod"></div>
            <h2>Welcome to Daily Habit</h2>
           
             <form onSubmit={handleSubmit}>
              <div class="form-group">
                <label> User Email</label>
                <input type="text" required value={email} placeholder="Email" onChange={(e)=>setEmail(e.target.value)}/> 
                <label> Password</label>
                <input type="password" required value={password} placeholder="Password"  onChange={(e)=>setPassword(e.target.value)}/> 
                <button >Login</button>
                {error && <p style={{ color: 'red' ,textAlign:'center'}}>{error}</p>}
                </div>
             </form>
            
             <div className="regestir-her">
             <h4>You dont have an acount </h4>
             <Link to="/register">Register her!</Link>
             </div>
            
        </div>
    )
    }


  