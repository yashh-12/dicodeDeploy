import { createContext, useContext, useState } from "react";

const LoaderContext = createContext();

export const LoaderProvider = ({children}) => {

    const [navLoader,setNavLoader] = useState(false);
    return (
        <LoaderContext.Provider value={{navLoader,setNavLoader}}>
            {children}
        </LoaderContext.Provider>
    )
}

const useLoader = () => {
    return useContext(LoaderContext);
}

export default useLoader;