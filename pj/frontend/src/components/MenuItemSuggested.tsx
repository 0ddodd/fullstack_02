import React from 'react'
import { User } from '../gql/graphql'
import { AiOutlineCheck } from 'react-icons/ai'

function MenuItemSuggested({user}: {user:User}) {
    console.log(user)
    return (
        <div className="flex items-center hover:bg-gray-100 rounded-md w-full py-1.5 px-2">
            <img 
                className="rounded-full lg:mx-0 mx-auto"
                width="35"
                src={user?.image ? user.image : "https://picsum.photos/200"}
            />
            <div className="lg:pl-2.5 lg-block">
                <div className="flex items-center">
                    <div className="font-bold text-[14px]">{user?.fullname ? user?.fullname : 'anonoymous'}</div>
                    <div className="ml-1 rounded-full bg-[#58D5EC] h-[14px] relative">
                        {/* <AiOutlineCheck className="relatie" color="#FFFFFF" size="15" /> */}
                    </div>
                </div>
                <div className="font-light text-[12px] text-gray-600">
                    {user?.bio}
                </div>
            </div>
        </div>
    )
}

export default MenuItemSuggested