import React from 'react'
import { IconType } from 'react-icons'
import { AiFillHome } from 'react-icons/ai'
import { BiGroup } from 'react-icons/bi'
import { RiLiveLine } from 'react-icons/ri'

interface IconComponentProps {
    iconString: string
    colorString: string
    sizeString: string
}
const MenuItem:React.FC<IconComponentProps> = ({
    iconString, colorString, sizeString
}) => {
    let Icon: IconType | null = null;

    switch (iconString) {
        case "Home":
            Icon = AiFillHome;
            break;
        case "Following":
            Icon = BiGroup;
            break;
        case "LIVE":
            Icon = RiLiveLine;
            break;
        default:
            Icon = null;
            break;
    }
    
    return (
        <div className="w-full flex items-center hover:bg-gray-100 p-2.5 rounded-md">
            <div className="flex items-center lg:mx-0 mx-auto">
                {Icon && <Icon color={colorString} size={parseInt(sizeString, 10)} />}
                <span className={`lg:block hidden pl-[9px] mt-0.5 font-semibold text-[17px] text-[${colorString}]`}>
                    {iconString}
                </span>
            </div>
        </div>
    )
}

export default MenuItem