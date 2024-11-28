import React, { useEffect, useState } from 'react'

function UploadError({errorType}: {errorType: string}) {
    const [error, setError] = useState<string>("");
    
    useEffect(() => {
        switch (errorType) {
            case "caption":
                setError("150 characters are maximum.")
                break;
            case "bio":
                setError("80 characters are maximum.")
                break;
            case "file":
                setError("Only .mp4 files are allowed.")
                break;
            default:
                setError("");
                break;
        }

    }, [errorType, error])

    return (
        <div className="w-[100%] relative flex justify-center">
            <div className={[
                "absolute top-6 z-50 mx-auto bg-black text-white bg-opacity-70 px-14 py-3 rounded-sm",
                errorType ? "visible" : "invisible"
            ].join(" ")}>{error}</div>
        </div>
    )
}

export default UploadError