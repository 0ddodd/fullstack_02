import React, { useEffect, useRef, useState } from 'react'
import { GetPostsQuery, postType } from '../gql/graphql'
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
import { LIKE_POST } from '../graphql/mutations/LikePost';
import { usePostStore } from '../stores/postStore';
import { GET_POST_BY_ID } from '../graphql/queries/GetPostById';
import { UNLIKE_POST } from '../graphql/mutations/UnlikePost';
import { GET_LIKED_POSTS_BY_USER } from '../graphql/queries/GetLikedPostsByUser';
import { GET_POSTS_BY_USER_ID } from '../graphql/queries/GetPostsByUserId';

function PostFeed({post}: {post: PostType}) {

    const video = useRef<HTMLVideoElement>(null);
    const navigate = useNavigate();
    const loggedInUserId = useUserStore(state => state.id);
    const [isLiked, setIsLiked] = useState(false);
    
    // 삭제
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
        refetchQueries: [
            { query: GET_POSTS_BY_USER_ID, variables: { userId: loggedInUserId }},
        ]
    });

    const handleDelete = async (postId: number) => {
        await handleDeletePost({
            variables: {
                id: postId
            }
        });
    };

    // 좋아요
    const [likePostMutation] = useMutation(LIKE_POST, {
        refetchQueries: [
            {
                query: GET_ALL_POSTS,
                variables: { skip: 0, take: 10 }
            },
            {
                query: GET_POST_BY_ID,
                variables: { id: post.id }
            },
            {
                query: GET_LIKED_POSTS_BY_USER,
                variables: { userId: Number(loggedInUserId) }
            }
        ],
        update(cache, { data: likePost }) {
            const existingPost = cache.readQuery({
                query: GET_POST_BY_ID,
                variables: { id: post.id }
            });
            
            if (existingPost) {
                const updatedPost = {
                    ...existingPost.getPostById,
                    likes: [...existingPost.getPostById.likes, likePost]
                };
                console.log('🆕')
                console.log(updatedPost);
    
                cache.writeQuery({
                    query: GET_POST_BY_ID,
                    variables: { id: post.id },
                    data: {
                        getPostById: updatedPost
                    }
                });
            };


        }
    });

    const [removeLikeMutation] = useMutation(UNLIKE_POST, {
        refetchQueries: [
            {
                query: GET_ALL_POSTS,
                variables: { skip: 0, take: 10 }
            },
            {
                query: GET_POST_BY_ID,
                variables: { id: post.id }
            },
            {
                query: GET_LIKED_POSTS_BY_USER,
                variables: { userId: Number(loggedInUserId) }
            }
        ],
        update(cache, { data: unlikePost }) {
            const existingPost = cache.readQuery({
                query: GET_POST_BY_ID,
                variables: { id: post.id }
            });

            if (existingPost) {
                const updatedLikes = existingPost.getPostById.likes.filter(like => like.id !== unlikePost.id);
                const updatedPost = {
                    ...existingPost.getPostById,
                    likes: updatedLikes
                };

                cache.writeQuery({
                    query: GET_POST_BY_ID,
                    variables: { id: post.id },
                    data: { getPostById: updatedPost }
                });
                
            };


            
        }
    });

    const likePost = usePostStore((state => state.likePost));
    const removeLike = usePostStore((state) => state.removeLike);
    
    const handleLikePost = async (id: number) => {
        if (loggedInUserId == post.user.id) return;
        await likePostMutation({
            variables: {postId: id}
        });
        likePost({
            id: Number(id),
            userId: Number(loggedInUserId),
            postId: Number(id)
        })
    };

    const handleRemoveLike = async (id: number) => {
        if (loggedInUserId === post.user.id) return;
        await removeLikeMutation({
            variables: { postId: id }
        });
        removeLike(id);
    };

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
                        onClick={()=>navigate(`post/${post.id}`, {state: {from: '/'}})}
                        >
                        <video 
                            ref={video}
                            src={`https://vpu.onrender.com/files/${post.video}`}
                            loop
                            muted
                            className="rounded-xl object-cover mx-auto h-full"
                        />
                    </div>

                    <div className="relative mr-[75px]">
                        <div className="absolute bottom-0 pl-2">
                            {post.user.id === loggedInUserId && (
                                <button onClick={() => handleDelete(post.id)} className="rounded-full bg-gray-200 p-2 mb-2 cursor-pointer">
                                    <MdDelete size="25" color="black" />
                                </button>
                            )}
                            <button
                                onClick={()=> {
                                    post.likes.find(like => like.userId === loggedInUserId)
                                    ? handleRemoveLike(post.id)
                                    : handleLikePost(post.id)
                                }}
                                className={`rounded-full bg-gray-200 p-2 ${post.user.id === loggedInUserId ? "" : "cursor-pointer"}`}
                                disabled={post.user.id === loggedInUserId}
                            >
                                <AiFillHeart
                                    size="25"
                                    color={post.likes.find(like => like.userId === loggedInUserId) ? "red" : "black" }
                                />
                                <span className="text-xs text-gray-800 font-semibold">
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