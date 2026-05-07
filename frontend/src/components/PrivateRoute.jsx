import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../services/AuthContext"

export default function PrivateRoute(){
    const {user, loading} = useAuth();

    if(loading) return null;

    return user ? <Outlet /> : <Navigate to="/login" />;
}


export function AdminRoute() {
    const {user, loading} = useAuth();

    if(loading) return null;

    if(!user) return <Navigate to="/login" />;

    if(user.role !== "admin") return <Navigate to="/" replace />;

    return <Outlet />;
}