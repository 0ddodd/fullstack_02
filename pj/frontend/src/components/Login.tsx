import React, { useState } from 'react'
import { useMutation } from "@apollo/client"
import { LoginUserMutation } from '../gql/graphql';
import { useUserStore } from '../stores/userStore';
import { useGeneralStore } from '../stores/generalStore';
import { GraphQLErrorExtensions } from 'graphql';
import Input from './Input';
import { LOGIN_USER } from '../graphql/mutations/Login';

function Login() {
    const [loginUser, {loading, error, data}] = useMutation<LoginUserMutation>(LOGIN_USER);
    
    const setUser = useUserStore((state) => state.setUser);
    const setIsLoginOpen = useGeneralStore((state) => state.setLoginIsOpen);
    const [errors, setErrors] = useState<GraphQLErrorExtensions>({});
    const [invalidCredentials, setInvalidCredentials] = useState("");

    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    const handleLogin = async() => {
        setErrors({})

        try {
            const resp = await loginUser({
                variables: {
                    email: loginData.email,
                    password: loginData.password,
                }
            });

            if (resp?.data?.login.user) {
                
                const user = resp.data.login.user;
                console.log('🧑');
                console.log(user);

                setUser({
                    id: user.id,
                    email: user.email || '',
                    fullname: user.fullname,
                    bio: user.bio || '',
                    image: user.image || ''
                });

                setIsLoginOpen(false);
            }


        } catch (err) {
            if (err.graphQLErrors[0].extensions?.invalidCredentials) {
                console.log(err.graphQLErrors[0].extensions.invalidCredentials)
                setInvalidCredentials(err.graphQLErrors[0].extensions?.invalidCredentials)
            } else {
                setErrors(err.graphQLErrors[0].extensions);
            }
        }
        
    }

    return (
        <>
            <div className="text-center text-[28px] mb-4 font-bold">Log in</div>
    
            <div className="px-6 pb-2">
                <Input
                    max={64}
                    placeHolder="Email"
                    inputType="email"
                    onChange={(e) => setLoginData({
                        ...loginData,
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
                    onChange={(e) => setLoginData({
                        ...loginData,
                        password: e.target.value
                    })}
                    autoFocus={false}
                    error={errors?.password as string}
                />
            </div>

            <div className="px-6 mt-6">
                <span className="text-red-500 text-[14px] font-semibold">{invalidCredentials}</span>
                <button
                    className={[
                    "w-full text-[17px] font-semibold text-white py-3 rounded-sm",
                    !loginData.email ||
                    !loginData.password
                        ? "bg-gray-200"
                        : "bg-[var(--primary-color)]",
                    ].join(" ")}
                    onClick={handleLogin}
                >Login</button>
            </div>
        </>
    )
}

export default Login