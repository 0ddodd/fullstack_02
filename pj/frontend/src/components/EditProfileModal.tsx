import React, { useEffect, useRef, useState } from 'react'
import { useGeneralStore } from '../stores/generalStore';
import { useUserStore } from '../stores/userStore';
import Cropper, { ReactCropperElement } from "react-cropper"
import "cropperjs/dist/cropper.css"
import { useMutation } from '@apollo/client';
import { UPDATE_USER_PROFILE } from '../graphql/mutations/UpdateUserProfile';
import { UpdateUserProfileMutation } from '../gql/graphql';
import { AiOutlineClose } from 'react-icons/ai';
import { BsFillPencilFill } from 'react-icons/bs';
import Input from './Input';

function EditProfileModal() {
    const [updateUserProfile, {data, loading, error}] = useMutation<UpdateUserProfileMutation>(UPDATE_USER_PROFILE);
    
    const [selectedImage, setSelectedImage] = useState<string | undefined>();
    const [croppedImage, setCroppedImage] = useState<string | undefined>();
    const [file, setFile] = useState<File | null>(null);
    const isEditProfileOpen = useGeneralStore((state) => state.isEditProfileOpen);
    const setIsEditProfileOpen = useGeneralStore((state) => state.setIsEditProfileOpen);
    
    const user = useUserStore((state) => state);
    const setUser = useUserStore((state) => state.setUser);

    const [username, setUsername] = useState<string>(user.fullname ?? "");
    const [bio, setBio] = useState<string>(user.bio ?? "");

    const [croppingDone, setCroppingDone] = useState<boolean>(false);
    const [isUpdated, setIsUpdated] = useState<boolean>(false);
    const cropperRef = useRef<ReactCropperElement>(null);


    useEffect(() => {
        if (username.length > 0 || bio.length > 0) {
            setIsUpdated(true);
        } else {
            setIsUpdated(false);
        }
    }, [username, bio]);

    const saveCroppedImage = () => {
        const cropper = cropperRef?.current?.cropper;
        // console.log(cropper)

        setCroppingDone(true);

        if (cropper) {
            const croppedImageUrl = cropper.getCroppedCanvas().toDataURL();
            setSelectedImage(croppedImageUrl);
            setCroppedImage(croppedImageUrl);
        };
    };

    const selectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedImage(URL.createObjectURL(e.target.files[0]));
            setFile(e.target.files[0]);
            setCroppedImage(undefined); // 기존 크롭 이미지 초기화 -> 크롭창 새로 열리게
            setCroppingDone(false); // 크롭 상태 초기화
        }
    };

    const updateProfile = async () => {
        const cropperInstance = cropperRef?.current?.cropper;
        console.log(cropperInstance)
        const input: {fullname: string; bio: string; image: File | null} = {
            fullname: username, 
            bio,
            image: null,
        };

        if (cropperInstance) {
            cropperInstance.getCroppedCanvas().toBlob(async (blob) => {
                try {
                    if (blob) {
                        input.image = new File([blob], "profile.jpg", { type: "image/jpg "})
                    };

                    console.log(input)
                    console.log({...input})

                    const resp = await updateUserProfile({
                        variables: {
                            ...input
                        }
                    });
                    console.log(resp);

                    if (resp) {
                        setUser({
                            id: Number(resp.data?.updateUserProfile.id),
                            fullname: username,
                            bio,
                            image: resp.data?.updateUserProfile.image 
                            ? resp.data.updateUserProfile.image 
                            : 'https://picsum.photos/id/83/300/230'
                        });
                        
                        setIsEditProfileOpen();

                    }
                } catch (err) {
                    console.log(err)
                }

                // return updateUserProfile({
                //     variables: {
                //         ...input,
                //     }
                // }).then((res) => {
                //     setUser({
                //         id: Number(res.data?.updateUserProfile.id),
                //         fullname: username,
                //         bio,
                //         image: res.data?.updateUserProfile.image ? 
                //         res.data.updateUserProfile.image :
                //         'https://picsum.photos/id/83/300/230'
                //     });
                //     setIsEditProfileOpen()
                // }).catch((err) => {
                //     console.log(err);
                // })
            })
        }
    };

    const cropAndUpdateImage = async () => {
        setCroppingDone(false);
        await updateProfile();
    }

    return (
            <div
                id="EditProfileModal"
                className="fixed flex justify-center items-center z-50 top-0 left-0 w-full h-full bg-black bg-opacity-50"
            >
                <div
                    className={`relative max-w-[700px] w-full mx-4 p-6 bg-white rounded-lg shadow-lg ${
                        !selectedImage ? "h-auto" : "h-[600px]"
                    }`}
                >
                    {/* Header Section */}
                    <div className="flex items-center justify-between border-b border-gray-300 pb-4">
                        <h2 className="text-xl font-bold">Edit Profile</h2>
                        <button onClick={() => setIsEditProfileOpen()} className="p-2">
                            <AiOutlineClose size={24} />
                        </button>
                    </div>
            
                {/* Content Section */}
                <div className={`mt-6 ${selectedImage && !croppedImage ? "hidden" : ""}`}>
                    {/* Profile Photo Section */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start border-b border-gray-300 pb-4 mb-4">
                        <div className="font-semibold text-gray-700 sm:w-[160px] text-center sm:text-left">
                            Profile Photo
                        </div>
                        <div className="relative flex items-center justify-center mt-4 sm:mt-0">
                            <label htmlFor="image" className="cursor-pointer">
                                <img
                                    src={croppedImage || user.image}
                                    alt="Profile"
                                    className="rounded-full object-cover w-20 h-20"
                                />
                                <div className="absolute bottom-0 right-0 rounded-full bg-white shadow-md border border-gray-300 p-1 w-8 h-8 flex items-center justify-center">
                                    <BsFillPencilFill size={16} />
                                </div>
                            </label>
                            <input
                                type="file"
                                id="image"
                                className="hidden"
                                onChange={selectImage}
                                accept="image/*"
                            />
                        </div>
                    </div>
            
                    {/* Username Section */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start border-b border-gray-300 pb-4 mb-4">
                        <div className="font-semibold text-gray-700 sm:w-[160px] text-center sm:text-left">
                            Username
                        </div>
                        <div className="mt-4 sm:mt-0 w-full max-w-md">
                            <input
                                type="text"
                                value={username}
                                placeholder="Username"
                                maxLength={30}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Username can only contain letters, numbers, underscores.
                            </p>
                        </div>
                    </div>
            
                    {/* Bio Section */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start">
                        <div className="font-semibold text-gray-700 sm:w-[160px] text-center sm:text-left">
                            Bio
                        </div>
                        <div className="mt-4 sm:mt-0 w-full max-w-md">
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                maxLength={80}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Tell us about yourself"
                            />
                            <p className="text-xs text-gray-500 mt-2">{bio.length}/80</p>
                        </div>
                    </div>
                </div>
        
                {/* Cropper Section */}
                {selectedImage && !croppedImage && (
                    <div className="w-full flex flex-col items-center justify-center">
                        <div className="w-full flex-grow flex items-center justify-center">
                            <Cropper
                                style={{ height: "400px", width: "100%" }}
                                src={selectedImage}
                                guides={false}
                                initialAspectRatio={1}
                                aspectRatio={1}
                                viewMode={1}
                                ref={cropperRef}
                                minCropBoxHeight={10}
                                minCropBoxWidth={10}
                                background={true}
                                responsive={true}
                                preview=".img-preview"
                            />
                        </div>
                    </div>
                )}

                {/* Footer Section */}
                <div className="mt-6 border-t border-gray-300 pt-4 flex justify-end space-x-4">
                    <button
                        onClick={setIsEditProfileOpen}
                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    {selectedImage && !croppedImage ? (
                    // 크롭 창이 활성화된 경우
                        <button
                            onClick={saveCroppedImage}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            Save Crop
                        </button>
                    ) : (
                        // 일반 모드일 때
                        <button
                            onClick={cropAndUpdateImage}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            Apply
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EditProfileModal