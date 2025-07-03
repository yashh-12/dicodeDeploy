import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({children}) => {

    const [userData,setUserData] = useState(null);
    return (
        <UserContext.Provider value={{userData,setUserData}}>
            {children}
        </UserContext.Provider>
    )
}

const useUser = () => {
    return useContext(UserContext);
}

export default useUser;