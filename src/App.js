import { createBrowserRouter, Route, RouterProvider, createRoutesFromElements } from "react-router-dom"
import { AuthProvider } from "./components/AuthProvider"
import Navigation from "./navigation"
import Home from "./pages/Home"
import Login from "./pages/Login"
import PersonalHabits from "./pages/PersonalHabits"
import ProtectedRoute from './components/ProtectedRoute';

import './App.css'
import Register from "./pages/Register"


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
    <Route path="/login" element={<Login />} />  
    <Route path="/register" element={<Register />} />  

    <Route path="/" element={<ProtectedRoute><Navigation /></ProtectedRoute>}>
      <Route index element={<Home />} />  
   
    <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />  
    <Route path="/personal-habits" element={<ProtectedRoute><PersonalHabits /></ProtectedRoute>}/>
    </Route>
    
  </>
  )
)

function App() {
  return (
    <AuthProvider>
    <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
