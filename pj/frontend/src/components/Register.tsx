import React, { useState } from 'react'
import { REGISTER_USER } from '../graphql/mutations/Register'
import { useMutation } from "@apollo/client"
import { RegisterUserMutation } from '../gql/graphql';
import { useUserStore } from '../stores/userStore';
import { useGeneralStore } from '../stores/generalStore';
import { GraphQLErrorExtensions } from 'graphql';

function Register() {
    const [registerUser, {loading, error, data}] = useMutation(REGISTER_USER);
    
    const setUser = useUserStore((state) => state.setUser);
    const setIsLoginOpen = useGeneralStore((state) => state.setLoginIsOpen);
    const [errors, setErrors] = useState<GraphQLErrorExtensions>({});
    const [registerData, setRegisterData] = useState({
        email: "",
        password: "",
        fullName: "",
        confirmPassword: ""
    });

    const handleRegister = async() => {
        setErrors({})

        await registerUser({
            variables: {
                email: registerData.email,
                password: registerData.password,
                fullname: registerData.fullName,
                confirmPassword: registerData.confirmPassword
            }
        }).catch((err) => {
            console.log(err.graphQLErrors);
            setErrors(err.graphQLErrors[0].extensions);
        });

        if (data?.register.user) {
            setUser({
                id: data?.register.user.id,
                email: data?.register.user.email,
                fullname: data?.register.user.fullname
            });
            setIsLoginOpen(false);
        }
    }

    return (
        <div>
            <div className="text-center text-[28px] mb-4 font-bold"></div>
        </div>
    )
}

export default Register