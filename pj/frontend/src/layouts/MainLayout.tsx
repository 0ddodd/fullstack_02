import React, { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import UpperNav from '../components/UpperNav'
import SideNav from '../components/SideNav'

function MainLayout({children}:{children:ReactNode}) {
    return (
        <div>
            <header>
                <UpperNav />
            </header>
            <div className={[
                useLocation().pathname === "/" ? "max-w-[1140px]" : '',
                "flex justify-between mx-auto 2-full lg:px-2.5 px-0"
            ].join(" ")}>
                <SideNav />
            </div>
            {children}
        </div>
    )
}

export default MainLayout