import { useMutation } from '@apollo/client';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { CREATE_POST } from '../graphql/mutations/CreatePost';
import UploadError from '../components/UploadError';
import UploadLayout from '../layouts/UploadLayout';
import { FiUploadCloud } from "react-icons/fi"
import { IoCheckmarkDoneCircleOutline } from 'react-icons/io5';
import { GiBoxCutter } from 'react-icons/gi';
import { GET_ALL_POSTS } from '../graphql/queries/GetPosts';
import { GET_POSTS_BY_USER_ID } from '../graphql/queries/GetPostsByUserId';
import { useUserStore } from '../stores/userStore';

function Upload() {
    const [show, setShow] = useState(false);
    const [fileData, setFileData] = useState<File | null>(null);
    const [fileDisplay, setFileDisplay] = useState<string | undefined>("");
    const [errors, setErrors] = useState<string[]>([]);
    const [errorType, setErrorType] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [caption, setCaption] = useState("");
    const loggedInUserId = useUserStore((state) => state.id);

    const fileRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFileDisplay(URL.createObjectURL(e.target.files[0]));
            setFileData(e.target.files[0]);
        }
    };

    const [createPost, {loading}] = useMutation(CREATE_POST, {
        onError: (err) => {
            console.log(err);
            // setErrors(err.graphQLErrors[0].extensions?.errors as string[]);
        },
        // variables: {
        //     text: caption,
        //     video: fileData
        // }
        // update: (cache, { data }) => {
        //     // 새로 업로드된 포스트를 캐시에 추가
        //     console.log('update')
        //     const newPost = data.createPost;
        //     console.log('newPost')
        //     console.log(newPost)
    
        //     const existingPosts = cache.readQuery({ query: GET_ALL_POSTS, variables: { skip: 0, take: 10 } });
        //     console.log('existingPosts');
        //     console.log(existingPosts);

        //     cache.writeQuery({
        //         query: GET_ALL_POSTS,
        //         variables: { skip: 0, take: 10 },
        //         data: {
        //             getPosts: [newPost, ...existingPosts.getPosts],
        //         },
        //     });
        // },
        refetchQueries: [
            { query: GET_ALL_POSTS, variables: { skip: 0, take: 10, keyword: "" }},
            { query: GET_POSTS_BY_USER_ID, variables: { userId: loggedInUserId } },        
        ],
    });

    const handleCreatePost = async () => {
        if (!fileData) {
            setErrors(["Please upload a video before posting."]);  // 파일이 없으면 오류 표시
            return;
        }
        try {
            setIsUploading(true);
            const resp = await createPost({
                variables: {
                    text: caption,
                    video: fileData
                }
            });

            if (resp) {
                console.log('Response:', resp);
            } else {
                console.log('No response received');
            }

            setIsUploading(false);
            setShow(true);
            clearVideo();

        } catch (err) {
            console.log(err)
        }
    };

    const onDrop = (e) => {
        setErrorType(null);
        setFile(e.dataTransfer.files[0]);

        const extension = e.dataTransfer.files[0].name.split(".").pop();
        if (extension !== "mp4") {
            setErrorType("file");
            return;
        };

        setFileDisplay(URL.createObjectURL(e.dataTransfer.files[0]));

    };

    const clearVideo = () => {
        setFile(null);
        setFileDisplay(undefined);
    };

    const discard = () => {
        setFile(null);
        setFileDisplay(undefined);
        setCaption("");
    };

    useEffect(() => {
        if (caption.length === 150) {
            setErrorType("caption");
            return;
        }
        setErrorType(null);
    }, [errorType, caption]);

    return (
        <>
        <UploadError errorType={errorType} />
        <UploadLayout>
            <div className="w-full mt-[75px] mb-[10px] bg-white shadow-lg rounded-md py-6 md:px-10 px-4">
            <div>
                <div className="text-[23px] font-semibold">Upload video</div>
                <div className="text-gray-400 mt-1">
                    Post a video to your account
                </div>
            </div>
            <div className="mt-8 md:flex gap-6">
                {!fileDisplay ? (
                <label
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault()
                        onDrop(e)
                    }}
                    htmlFor="fileInput"
                    className="md:mx-0 mx-auto mt-4 mb-6 flex flex-col items-center justify-center w-full max-w-[260px] h-[470px] text-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                    <FiUploadCloud size="50" color="#b3b3b1" />
                    <div className="mt-4 text-[17px]">Select a video to upload</div>
                    <div className="mt-1.5 text-gray-500 text-[13px]">
                        Or drag and drop a file
                    </div>
                    <div className="mt-12 text-gray-400 text-sm">MP4</div>
                    <div className="mt-2 text-gray-400 text-[13px]">
                        Up to 30 minutes
                    </div>
                    <div className="mt-2 text-gray-400 text-[13px]">
                        Less than 2 GB
                    </div>
                    <div className="px-2 py-1.5 mt-8 text-white text-[15px] w-80% bg-[var(--primary-color)] rounded-sm">
                        Select file
                    </div>
                    <input
                        ref={fileRef}
                        type="file"
                        id="fileInput"
                        className="hidden"
                        accept=".mp4"
                        onChange={(e) => handleFileChange(e)}
                    />
                </label>
                ) : (
                <>
                    <div className="md:mx-0 mx-auto mt-4 md:mb-12 mb-16 flex items-center justify-center w-full max-w-[260px] h-[540px] p-3 rounded-2xl cursor-pointer relative">
                        <div className="bg-black h-full w-full" />
                        <img
                            className="absolute z-20 pointer-events-none"
                            src="src/assets/images/mobile-case.png"
                        />
                        <img
                            className="absolute right-4 bottom-6 z-20"
                            width="90"
                            // src="src/assets/images/logo-white.png"
                        />
                        <video
                            autoPlay
                            loop
                            muted
                            className="absolute rounded-xl object-cover z-10 p-[13px] w-full h-full"
                            src={fileDisplay}
                        />
                        <div className="absolute -bottom-12 flex items-center justify-between border-gray-300 w-full p-2 border rounded-xl z-50  ">
                            <div className="flex items-between truncate">
                                <IoCheckmarkDoneCircleOutline
                                    size="16"
                                    className="min-w-[16px]"
                                />
                                <div className="text-[11px] pl-1 truncate text-ellipsis">
                                    {fileData?.name}
                                </div>
                            </div>
                            <button
                                onClick={clearVideo}
                                className="text-[11px] ml-4 font-semibold"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 mb-6">
                        <div className="flex bg-[#F8F8F8] py-4 px-6">
                            <GiBoxCutter className="mr-4" size="20" />

                            <div>
                                <div className="text-semibold text-[15px] mb-1.5">
                                    Divide videos and edit
                                </div>
                                <div className="text-semibold text-[13px] text-gray-400">
                                    You can quickly divide videos into multiple clips and
                                    edit them.
                                </div>
                            </div>

                            <div className="flex justify-end max-w-[130px] w-full h-full text-center my-auto">
                                <button className="px-8 py-1.5 text-white text-[15px] bg-[var(--primary-color)] rounded-sm">
                                    Edit
                                </button>
                            </div>
                        </div>

                        <div className="mt-5">
                            <div className="flex items-center justify-between">
                                <div className="mb-1 text-[15px]">Caption</div>
                                <div className="text-gray-400 text-[12px]">
                                    {caption.length}
                                </div>
                            </div>
                            <input
                                onChange={(e) => setCaption(e.target.value)}
                                maxLength={150}
                                className="w-full border p-2.5 rounded-md focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={discard}
                                className="px-10 py-2.5 mt-8 border text-[16px] hover:bg-gray-100 rounded-sm"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleCreatePost}
                                className="px-10 py-2.5 mt-8 border text-[16px] text-white bg-[var(--primary-color)] rounded-sm"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                </>
                )}
                </div>
            </div>
        </UploadLayout>
        </>
    )
}

export default Upload