import { ReactNode, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "../stores/userStore"
import { useGeneralStore } from "../stores/generalStore"

export const ProtectedRoutes = ({ children }: { children: ReactNode }) => {
    const user = useUserStore((state) => state);
    const setUser = useUserStore((state) => state.setUser);

    const navigate = useNavigate();
    const setLoginIsOpen = useGeneralStore((state) => state.setLoginIsOpen);
    // useEffect(() => {
    //     if (!user.id) {
    //         navigate("/")
    //         setLoginIsOpen(true)
    //     }
    // }, [user.id, navigate, setLoginIsOpen])
    
    useEffect(() => {
        // 예시: 사용자 데이터를 가져와서 저장
        const userData = {
            id: undefined,
            fullname: "",
            email: "",
            bio: "",
            image: "",
        };
        setUser(userData); // Zustand 상태 업데이트
        setLoginIsOpen(true)


    }, [setUser]);

    console.log("********");
    console.log(user); //뜸

    if (!user.id) {
        return <>No Access</>;
    }
    
    return <>{children}</>;

}
        
export default ProtectedRoutes