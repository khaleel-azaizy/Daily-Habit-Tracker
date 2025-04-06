import { useState,useEffect } from "react";
import { useNavigate,Link  } from "react-router-dom";
import {useAuth } from "../components/AuthProvider"



export default function Login(){
    const [email,setEmail]= useState('');
    const [password,setPassword]= useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState(''); 
    const [loading, setLoading] = useState(false);
    useEffect(() => {
      setLoading(true);
          
      
      fetch('http://localhost:4000/refresh', {credentials: 'include'})
      .then((response) => {
        if(response.ok){
          login();
         
          navigate('/home');
      
        }
      })
      .catch((error) => { 
        console.error('Error during refersh:', error);
      });
      setLoading(false);
    }, []);

    const handleSubmit =  (e) => {
        e.preventDefault();
        
            const user = {email,password};
         fetch('http://localhost:4000/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
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
         
          setError(error.message);

         })
      };

    
    
    return(
      <div>
        {loading&&(<div className="loading"></div>)}
        {!loading&&(
          <>
          <div className="login">
            
          <div className="blod"></div>
            <h2>Welcome</h2>
           
             <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input type="text" required value={email} placeholder="Email" onChange={(e)=>setEmail(e.target.value)}/> 
                <label> Password</label>
                <input type="password" required value={password} placeholder="Password"  onChange={(e)=>setPassword(e.target.value)}/> 
                <button >Login</button>
                {error && <p style={{ color: 'red' ,textAlign:'center'}}>{error}</p>}
                </div>
             </form>
            
             
            
        </div>
        <div className="regestir-her">
             <h4>You dont have an acount? </h4>
             <Link to="/register">Register here!</Link>
             </div>
        </>
      )}
        </div>
    )
    }


  