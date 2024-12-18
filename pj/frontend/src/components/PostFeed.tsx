import React, { useEffect, useRef } from 'react'
import { postType } from '../gql/graphql'
import { Link } from 'react-router-dom';
import { BsMusicNoteBeamed } from 'react-icons/bs';
import { AiFillHeart } from 'react-icons/ai';
import { IoChatbubbleEllipses } from "react-icons/io5"
import { IoIosShareAlt } from "react-icons/io"
import { useNavigate } from 'react-router-dom';
import { MdDelete } from 'react-icons/md';
import { useUserStore } from '../stores/userStore';
import { useMutation } from '@apollo/client';
import { DELETE_POST } from '../graphql/mutations/DeletePost';
import { GET_ALL_POSTS } from '../graphql/queries/GetPosts';

function PostFeed({post}: {post: PostType}) {

    const video = useRef<HTMLVideoElement>(null);
    const navigate = useNavigate();
    const userId = useUserStore(state => state.id);
    
    const [handleDeletePost] = useMutation(DELETE_POST, {
        update(cache, { data }) {
            if (data?.deletePost) {
                cache.modify({
                    fields: {
                        getPosts(existingPosts = [], { readField }) {
                            return existingPosts.filter(
                                (postRef: any) => readField("id", postRef) !== data.deletePost.id
                            );
                        },
                    },
                });
            }
        },
    });
    const handleDelete = async (postId: number) => {
        await handleDeletePost({
            variables: {
                id: postId
            }
        });
    }

    useEffect(() => {

        if (video.current) {
            video.current
            .play()
            .catch((err) => {
                console.log(err);
            })
        }
    }, [])
    
    return (
        <div id="PostFeed" className="flex border-b py-6 px-16">
            <div className="cursor-pointer">
                <img className="rounded-full max-h-[60px]"
                    width="60px"
                    src={post?.user?.image ? post.user.image : "https://picsum.photos/200"}
                />
            </div>
            <div className="pl-3 w-full px-4">
                <div className="flex items-center justify-between pb-0.5">
                    <Link to={`/profile/${post.user.id}`}>
                        <span className='font-bold hover:underline cursor-pointer'>
                            {post.user.fullname}
                        </span>
                        {/* <span className='text-[13px] text-light text-gray-500 pl-1 cursor-pointer'>
                            {post.user.fullname}
                        </span> */}
                    </Link>

                    {/* <button className="border text-[15px] px-[21px] py-.5 border-[#F02C56] text-[#F02C56] hover:bg-[#ffeef2] font-semibold rounded-md">
                        Follow
                    </button> */}
                </div>

                <div className='text-[15px] pb-0.5 break-words md:max-w-[480px] max-w-[300px]'>
                    {post.text ? post.text : ''}
                </div>
                <div className="text-[14px] text-gray-500 pb-0.5">
                    {/* #super #awesome */}
                </div>
                <div className="text-[14px] pb-0.5 flex itesm-center font-semibold">
                    {/* <BsMusicNoteBeamed size="17" />
                    <div className="px-1">original - Awesome </div>
                    <AiFillHeart size="20" /> */}
                </div>

                <div className="mt-2.5 flex">
                    <div
                        className="relative min-h-[480px] max-h-[580px] max-w-[260px] flex items-center bg-black rounded-xl"
                        onClick={()=>navigate(`post/${post.id}`)}
                        >
                        <video 
                            ref={video}
                            src={`http://localhost:3000/${post.video}`}
                            loop
                            muted
                            className="rounded-xl object-cover mx-auto h-full"
                        />
                    </div>

                    <div className="relative mr-[75px]">
                        <div className="absolute bottom-0 pl-2">
                            {post.user.id === userId && (
                                <button className="rounded-full bg-gray-200 p-2 mb-2 cursor-pointer">
                                    <MdDelete onClick={() => handleDelete(post.id)} size="25" color="black" />
                                </button>
                            )}
                            <button className="rounded-full bg-gray-200 p-2 cursor-pointer">
                                <AiFillHeart size="25" color="black" />
                                <span onClick={()=>handleLikePost} className="text-xs text-gray-800 font-semibold">
                                    {post.likes?.length}
                                </span>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default PostFeed