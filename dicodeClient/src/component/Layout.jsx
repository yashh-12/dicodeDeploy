import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useLoaderData, useNavigate, useNavigation } from 'react-router-dom'
import useUser from '../provider/UserProvider'
import Loader from '../pages/Loader';
import { getUserDetails } from '../service/user.service';
import useLoader from '../provider/LoaderProvider';
function Layout() {

  const [authLoader, setAuthLoader] = useState(true);

  const navigate = useNavigate()
  const navigation = useNavigation();
  const { userData, setUserData } = useUser();
  const {navLoader} = useLoader();
  const userDetails = useLoaderData();

  useEffect(() => {
    try {
      if (userDetails?.success) {
        setUserData(userDetails?.data)
      } else {
        
        (async () => {
          const res = await getUserDetails();
          if (res.success) {
            setUserData(res.data);
          }
          else{
            setUserData(null);
          }
        })()
      }
    } catch (error) {
      setUserData(null)
    }
    finally {
      setAuthLoader(false);
    }
  }, [userDetails,navigate])

  if (navLoader || authLoader || navigation.state == "loading" ) {
    return <Loader />
  }

  const noLogNeeded = [
    '/login',
    '/register',
    '/forgot-password',
    '/',
  ].includes(location.pathname);

  if (userData && noLogNeeded) {
    navigate("/space")
  }

  if (!userData  && !noLogNeeded) {
    navigate("/")
  }

  return (
    <div><Outlet /></div>
  )
}

export default Layout