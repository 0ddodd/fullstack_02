import React, { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import UpperNav from '../components/UpperNav'
import SideNav from '../components/SideNav'
function MainLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <header>
                <UpperNav />
            </header>
            <div className="flex mx-auto max-w-[1140px] px-4 w-full">
                <aside className="lg:block w-[250px]">
                    <SideNav />
                </aside>

                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default MainLayout