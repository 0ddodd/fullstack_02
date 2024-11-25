import { ReactNode, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "../stores/userStore"
import { useGeneralStore } from "../stores/generalStore"

export const ProtectedRoutes = ({ children }: { children: ReactNode }) => {
    const userId = useUserStore((state) => state.id);
    const setUser = useUserStore((state) => state.setUser);

    const navigate = useNavigate();
    const setLoginIsOpen = useGeneralStore((state) => state.setLoginIsOpen);

    // 흠...
    useEffect(() => {
        if (!userId) {
            const userData = {
                id: undefined,
                fullname: "",
                email: "",
                bio: "",
                image: "",
            };
            setUser(userData);
            setLoginIsOpen(true)
            navigate("/")
        }
    }, [userId, setUser, setLoginIsOpen]);

    if (!userId) {
        return <>No Access</>;
    }
    
    return <>{children}</>;

}
        
export default ProtectedRoutes