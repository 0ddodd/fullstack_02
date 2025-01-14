import { useQuery } from '@apollo/client'
import React, { useState } from 'react'
import { GET_USERS } from '../graphql/queries/GetUsers'
import { useLocation, Link } from 'react-router-dom';
import MenuItem from './MenuItem';
import MenuItemSuggested from './MenuItemSuggested';
import { User } from '../gql/graphql';

function SideNav() {
    const {data, loading, fetchMore} = useQuery(GET_USERS, {});
    const [showAllUsers, setShowAllUsers] = useState(false);

    const displayedUsers:User[] = showAllUsers ? data?.getUsers : data?.getUsers.slice(0,3)

    return (
        <div
            id="SideNav"
            className={[
                useLocation().pathname === "/" ? "lg:w-[310px]" : "lg:w-[220px]",
                "fixed z-20 bg-white pt-[70px] h-full lg:border-r-0 border-r  overflow-auto",
            ].join(" ")}
        >
            <div className="lg:w-full w-[55px] mx-auto">
                <Link to="/">
                    <MenuItem
                        iconString="Home"
                        colorString="var(--primary-color)"
                        sizeString="28"
                    ></MenuItem>
                </Link>
                {/* <MenuItem
                    iconString="Following"
                    colorString="#000000"
                    sizeString="27"
                ></MenuItem>
                <MenuItem
                    iconString="LIVE"
                    colorString="#000000"
                    sizeString="27"
                ></MenuItem> */}
                <div className="border-b lg:ml-2 mt-2 w-4/5"></div>
            </div>

            <div className="lg:block hidden text-xs text-gray-600 font-semibold pt-4 pb-2 px-2">
                Accounts
            </div>
            <div className="lg:hidden block pt-3" />
            <ul>
                {displayedUsers?.map((user) => (
                    <li className="cursor-pointer" key={user.id}>
                        <Link to={`/profile/${user.id}`}>
                            <MenuItemSuggested user={user} />
                        </Link>
                    </li>
                ))}
            </ul>
            <button
                onClick={() => setShowAllUsers(!showAllUsers)}
                className="lg:block hidden text-[#4cb46f] pt-1.5 pl-2 text-[13px]"
            >
                See more
            </button>
        </div>
    )
}

export default SideNav