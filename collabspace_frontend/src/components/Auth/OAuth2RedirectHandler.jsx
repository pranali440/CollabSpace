import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useMyContext } from "../../store/ContextApi";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, setIsAdmin } = useMyContext();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    console.log("Token:", token);

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);

        // Save token
        localStorage.setItem('token', token);

        // Safe roles handling
        const roles = decodedToken.roles
          ? decodedToken.roles.split(',')
          : [];

        const user = {
          username: decodedToken.sub,
          roles: roles,
        };

        localStorage.setItem('USER', JSON.stringify(user));

        // Update context
        setToken(token);
        setIsAdmin(roles.includes('ROLE_ADMIN')); // better check

        // Navigate
        navigate('/notes');

      } catch (error) {
        console.error('Token decoding failed:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [location, navigate, setToken, setIsAdmin]);

  return <div>Redirecting...</div>;
};

export default OAuth2RedirectHandler;