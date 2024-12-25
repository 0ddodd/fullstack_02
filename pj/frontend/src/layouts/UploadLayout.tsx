import React, { ReactNode } from 'react'
import UpperNav from '../components/UpperNav'

function UploadLayout({children}: {children: ReactNode}) {
    return (
        <div className="bg-[#F8f8f8] ">
            <UpperNav />
            <div className="flex justify-between mx-auto w-full px-2 max-w-[1140px]">
                {children}
            </div>
        </div>
    )
}

export default UploadLayout