import React, { useState } from 'react'
import { REGISTER_USER } from '../graphql/mutations/Register'
import { useMutation } from "@apollo/client"
import { RegisterUserMutation } from '../gql/graphql';
import { useUserStore } from '../stores/userStore';
import { useGeneralStore } from '../stores/generalStore';
import { GraphQLErrorExtensions } from 'graphql';
import Input from './Input';

function Register() {
    const [registerUser, {loading, error, data}] = useMutation<RegisterUserMutation>(REGISTER_USER);
    
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

        try {
            const resp =  await registerUser({
                variables: {
                    email: registerData.email,
                    password: registerData.password,
                    fullname: registerData.fullName,
                    confirmPassword: registerData.confirmPassword
                }
            });

            if (resp?.data?.register.user) {
                setUser({
                    id: resp.data.register.user.id,
                    email: resp.data.register.user.email,
                    fullname: resp.data.register.user.fullname
                });

                setIsLoginOpen(false);
            
            };

        } catch (err) {
            console.log(err);
            setErrors(err.graphQLErrors[0].extensions);
        }
    }

    return (
        <>
            <div className="text-center text-[28px] mb-4 font-bold">Sign up</div>
    
            <div className="px-6 pb-2">
                <Input
                    max={64}
                    placeHolder="Name"
                    inputType="text"
                    onChange={(e) => setRegisterData({
                        ...registerData,
                        fullName: e.target.value
                    })}
                    autoFocus={true}
                    error={errors?.fullName as string}
                />
            </div>
            <div className="px-6 pb-2">
                <Input
                    max={64}
                    placeHolder="Email"
                    inputType="email"
                    onChange={(e) => setRegisterData({
                        ...registerData,
                        email: e.target.value
                    })}
                    autoFocus={false}
                    error={errors?.email as string}
                />
            </div>
            <div className="px-6 pb-2">
                <Input
                    max={64}
                    placeHolder="Password"
                    inputType="password"
                    onChange={(e) => setRegisterData({
                        ...registerData,
                        password: e.target.value
                    })}
                    autoFocus={false}
                    error={errors?.password as string}
                />
            </div>
            <div className="px-6 pb-2">
                <Input
                    max={64}
                    placeHolder="Confirm Password"
                    inputType="password"
                    onChange={(e) => setRegisterData({
                        ...registerData,
                        confirmPassword: e.target.value
                    })}
                    autoFocus={false}
                    error={errors?.confirmPassword as string}
                />
            </div>
            <div className="px-6 pb-2">
                <button
                    className={[
                    "w-full text-[17px] font-semibold text-white py-3 rounded-sm",
                    !registerData.email ||
                    !registerData.password ||
                    !registerData.fullName ||
                    !registerData.confirmPassword
                        ? "bg-gray-200"
                        : "bg-[var(--primary-color)]",
                    ].join(" ")}
                    onClick={handleRegister}
                >Register</button>
            </div>
        </>
    )
}

export default Register