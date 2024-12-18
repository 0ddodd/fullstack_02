import { useMutation, useQuery } from '@apollo/client';
import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CREATE_COMMENT } from '../graphql/mutations/CreateComment';
import { GET_COMMENTS_BY_POST_ID } from '../graphql/queries/GetCommentsByPostId';
import { GetCommentsByPostIdQuery, GetPostByIdQuery, GetPostsQuery } from '../gql/graphql';
import { DELETE_COMMENT } from '../graphql/mutations/DeleteComment';
import { usePostStore } from '../stores/postStore';
import { useUserStore } from '../stores/userStore';
import { LIKE_POST } from '../graphql/mutations/LikePost';
import { GET_POST_BY_ID } from '../graphql/queries/GetPostById';
import { UNLIKE_POST } from '../graphql/mutations/UnlikePost';
import { ImCross, ImSpinner2 } from 'react-icons/im';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import { AiFillHeart, AiFillPlayCircle } from 'react-icons/ai';
import { MdOutlineDeleteForever } from 'react-icons/md';
import { BsFillChatDotsFill, BsMusicNoteBeamed } from 'react-icons/bs';
import { GET_ALL_POSTS } from '../graphql/queries/GetPosts';

function Post() {

    const { id } = useParams<{id: string}>();
    const [comment, setComment] = useState<string>("");
    const navigate = useNavigate();

    const [createComment, { data: commentData }] = useMutation(CREATE_COMMENT, {
        refetchQueries: [
            {
                query: GET_COMMENTS_BY_POST_ID,
                variables: {
                    postId: Number(id),
                    text: comment,
                }
            }
        ]
    });

    const { data, loading: loadingComments } = 
    useQuery<GetCommentsByPostIdQuery>(GET_COMMENTS_BY_POST_ID, 
        {
            variables: {
                postId: Number(id)
            },
            onCompleted: () => console.log("코멘트 받아옴"),
            onError: (err) =>  console.error(err)
        },
    );

    const [deleteComment] = useMutation(DELETE_COMMENT, {
        update(cache, { data: { deleteComment }}) {
            const deletedCommentId = deleteComment.id;
            const existingComments = cache.readQuery<GetCommentsByPostIdQuery>({
                query: GET_COMMENTS_BY_POST_ID,
                variables: { postId: Number(id) }
            });
            const newComments = existingComments?.getCommentsByPostId.filter(
                (comment) => comment.id !== deletedCommentId
            );

            cache.writeQuery({
                query: GET_COMMENTS_BY_POST_ID,
                data: { getCommentsByPostId: newComments },
                variables: { postId: Number(id) }
            })
        }
    });

    const handleDeleteComment = async (commentId: number) => {
        await deleteComment({
            variables: {
                id: commentId
            }
        })
    };

    const [currentPostIdIndex, setCurrentPostIdIndex] = useState(0);

    const [isLoaded, setIsLoaded] = useState(false);

    const { data: dataPost, loading: loadingPost } = useQuery<GetPostByIdQuery>(GET_POST_BY_ID, {
        variables: {
            id: Number(id),
        },
        onCompleted: () => {
            setIsLoaded(true)
        },
    });

    const { data: dataAllPosts } = useQuery<GetPostsQuery>(GET_ALL_POSTS,
        {
            variables: {
                skip:0, take:10
            }
        }
    );

    useEffect(() => {
        if (dataAllPosts) {
            const currIndex = dataAllPosts.getPosts.findIndex((post) => post.id === Number(id));
            setCurrentPostIdIndex(currIndex);
        }
    }, [dataAllPosts, id]);

    const loopThroughPostsUp = () => {
        if (currentPostIdIndex === 0) return;
        const nextPostId = dataAllPosts?.getPosts[currentPostIdIndex - 1].id;
        navigate(`/post/${nextPostId}`);
        setCurrentPostIdIndex((prevIndex) => prevIndex - 1);
    };

    const loopThroughPostsDown = () => {
        if (currentPostIdIndex === dataAllPosts?.getPosts.length - 1) return;
        const nextPostId = dataAllPosts?.getPosts[currentPostIdIndex + 1].id;
        navigate(`/post/${nextPostId}`);
        setCurrentPostIdIndex((prevIndex) => prevIndex + 1);
    };

    const addComment = async () => {
        await createComment({
            variables: {
                postId: Number(id),
                text: comment,
            }
        })
    };

    const video = useRef<HTMLVideoElement>(null);

    const [inputFocussed, setInputFocussed] = useState(false);


    useEffect(() => {
        const handleLoadedData = () => {
            console.log("loaded...")
            video.current?.play()
            setTimeout(() => {
                setIsLoaded(true);
            }, 300)
        };

        const videoRef = video.current;
        videoRef?.addEventListener('loadeddata', handleLoadedData);

        return () => {
            if (!videoRef) return;
            videoRef?.removeEventListener('loadeddata', handleLoadedData);
            videoRef?.pause();
            videoRef.currentTime = 0;
            videoRef?.load();
            console.log('끝')
        }
    }, [isLoaded, setIsLoaded, id]);

    const [isPlaying, setIsPlaying] = useState(false);
    const toggleVideoPlay = () => {
        if (video.current) {
            if (!video.current.paused) {
                video.current.pause();
                setIsPlaying(false);
            } else {
                video.current.play();
                setIsPlaying(true);
            }
        }
    }

    // 좋아요
    const likedPosts = usePostStore((state) => state.likedPosts);
    const likePost = usePostStore((state) => state.likePost);
    const removeLike = usePostStore((state) => state.removeLike);
    const loggedInUserId = useUserStore((state) => state.id);

    const [likePostMutation] = useMutation(LIKE_POST, {
        variables: {
            postId: Number(id)
        },
        onCompleted: (data) => {
            console.log("data", data);
        },
        refetchQueries: [
            {
                query: GET_POST_BY_ID,
                variables: {
                    id: Number(id)
                }
            }
        ]
    });

    const [removeLikeMutation] = useMutation(UNLIKE_POST, {
        variables: {
            postId: Number(id)
        },
        refetchQueries: [
            {
                query: GET_POST_BY_ID,
                variables: {
                    id: Number(id)
                }
            }
        ]
    });

    const handleRemoveLike = async () => {
        if (loggedInUserId == dataPost.getPostById.user.id) return;
        await removeLikeMutation();
        removeLike(Number(id));
    };

    const handleLikePost = async () => {
        if (loggedInUserId == dataPost.getPostById.user.id) return;
        await likePostMutation();
        likePost({
            id: Number(id),
            userId: Number(loggedInUserId),
            postId: Number(id)
        })
    };

    // 상태 정의
    const [isLiked, setIsLiked] = useState<boolean>(false);
    // 좋아요 상태 업데이트 (현재 로그인한 사용자와 포스트 좋아요 상태 확인)
    useEffect(() => {
        if (dataPost) {
            const liked = dataPost.getPostById.likes.some(
                (like) => like.userId === loggedInUserId
            );

            // 기존 isLiked와 비교해서 변경이 필요하면 상태를 갱신
            if (liked !== isLiked) {
                setIsLiked(liked); // isLiked 상태를 갱신
            }
        }
    }, [dataPost, loggedInUserId, isLiked]);  // 의존성 배열에서 isLiked 추가
    

    return (
        <div
            className="fixed lg:flex justify-between z-50 top-0 left-0 w-full h-full bg-black lg:overflow-hidden overflow-auto"
            id="PostPage"
        >
            <div className="lg:w-[calc(100%-540px)] h-full relative">
                <Link
                    to="/"
                    className="absolute z-20 m-5 rounded-full hover:bg-gray-800 bg-gray-700 p-1.5"
                >
                    <ImCross color="#FFFFFF" size="27" />
                </Link>
                <button
                    onClick={loopThroughPostsUp}
                    className={`absolute z-20 right-4 top-4 flex items-center justify-center rounded-full p-1.5 
                        ${currentPostIdIndex === 0 ? "bg-gray-900" : "bg-gray-700 hover:bg-gray-800" }
                    `}
                    disabled={currentPostIdIndex === 0}
                >
                    <BiChevronUp color="#FFFFFF" size="30" />
                </button>
                <button
                    onClick={loopThroughPostsDown}
                    className={`absolute z-20 right-4 top-20 flex items-center justify-center rounded-full p-1.5 
                        ${currentPostIdIndex === dataAllPosts?.getPosts.length - 1 
                            ? "bg-gray-900" : "bg-gray-700 hover:bg-gray-800"}
                    `}
                    disabled={currentPostIdIndex === dataAllPosts?.getPosts.length - 1 }
                >
                    <BiChevronDown color="#FFFFFF" size="30" />
                </button>

                {loadingPost ? (
                    <div className="flex items-center justify-center bg-black bg-opacity-70 h-screen lg:min-w-[400px]">
                        <ImSpinner2
                            className="animate-spin ml-1"
                            size="100"
                            color="#FFFFFF"
                        />
                    </div>
                ) : (
                <div className="bg-black bg-opacity-90 lg:min-w-[480px] relative" onClick={toggleVideoPlay}>
                    <video
                        ref={video}
                        src={"http://localhost:3000/" + dataPost?.getPostById.video}
                        loop
                        muted
                        className="h-screen mx-auto"
                    />
                    {/* {isPlaying && (
                    <AiFillPlayCircle
                        size="100"
                        className="rounded-full z-100 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black cursor-pointer"
                    />
                    )} */}
                </div>
                )}
            </div>

            {/* InfoSection */}
            <div
                className="lg:max-w-[550px] relative w-full h-full bg-white"
                id="InfoSection"
            >
                <div className="py-7" />
                    <div className="flex items-center justify-between px-8">
                        <div className="flex items-center">
                            <Link to="/">
                                <img
                                    className="rounded-full lg:mx-0 mx-auto"
                                    width="40"
                                    src={dataPost?.getPostById?.user.image ? dataPost?.getPostById?.user.image : "https://picsum.photos/id/8/300/320"}
                                />
                            </Link>
                            <div className="ml-3 pt-0.5">
                                <div className="text-[17px] font-semibold">{dataPost?.getPostById?.user.fullname ? dataPost?.getPostById?.user.fullname : "anonymous"}</div>
                                    <div className="text-[13px] -mt-5 font-light">
                                        <span className="relative top-[6px] text-[30px] pr-0.5"></span>
                                        <span className="font-medium">
                                            {new Date(dataPost?.getPostById?.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <MdOutlineDeleteForever size="25" className="cursor-pointer" />
                        </div>
                        <div className="px-8 mt-4 text-sm"> {dataPost?.getPostById?.text}</div>
                        <div className="px-8 mt-4 text-sm font-bold">
                            {/* <BsMusicNoteBeamed size="17" />
                            Original sound - username */}
                        </div>

                        {/* Like & Comments Section */}
                        <div className="flex items-center px-8 mt-8">
                            <div className="pb-4 text-center flex items-center">
                                <button
                                    disabled={dataPost?.getPostById?.userId === loggedInUserId}
                                    className="rounded-full bg-gray-200 p-2 cursor-pointer"
                                    onClick={() => (isLiked ? handleRemoveLike() : handleLikePost())}
                                >
                                    <AiFillHeart size="25" color={isLiked ? "red" : "black"} />
                                </button>
                                <span className="text-xs pl-2 pr-4 text-gray-800 font-semibold">
                                    {dataPost?.getPostById?.likes.length}
                                </span>
                            </div>
                            <div className="pb-4 text-center flex items-center">
                                <div className="rounded-full bg-gray-200 p-2 cursor-pointer">
                                    <BsFillChatDotsFill size="25" color="black" />
                                </div>
                                <span className="text-xs pl-2 pr-4 text-gray-800 font-semibold">
                                    {data?.getCommentsByPostId?.length}
                                </span>
                            </div>
                        </div>

                        {/* Comments */}
                        <div
                            id="Comments"
                            className="bg-[#F8F8F8] z-0 w-full h-[calc(100%-273px)] border-t-2 overflow-auto"
                        >
                            <div className="pt-2" />
                            {data?.getCommentsByPostId.length === 0 && (
                                <div className="text-center mt-6 text-xl text-gray-500">
                                    No comments...
                                </div>
                            )}
                            <div className="flex flex-col items-center justify-between px-8 mt-4">
                                {data?.getCommentsByPostId.map((comment) => (
                                <div className="flex items-center relative w-full" key={comment.id}>
                                    <Link to="/">
                                        <img
                                            className="absolute top-0 rounded-full lg:mx-0 mx-auto"
                                            width="40"
                                            src={
                                                comment.user.image 
                                                ? comment.user.image
                                                : "https://picsum.photos/id/8/300/320"
                                            }
                                        />
                                    </Link>
                                    <div className="ml-14 pt-0.5 w-full">
                                        <div className="text-[18px] font-semibold flex items-center justify-between">
                                            {comment.user.fullname ? comment.user.fullname : "anonymous" }
                                            {comment.user.id === Number(loggedInUserId) && (
                                                <MdOutlineDeleteForever
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    size="25"
                                                    className="cursor-pointer"
                                                />
                                            )}
                                        </div>
                                        <div className="text-[15px] font-light">{comment.text}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mb-28" />
                    </div>

                    {/* Create Comment Section */}
                    <div
                        id="CreateComment"
                        className="absolute flex items-center justify-between bottom-0 bg-white h-[85px] lg:max-w-[550px] w-full py-5 px-8 border-t-2 "
                    >
                        <div
                            className={[
                            inputFocussed
                                ? "border-2 border-gray-400"
                                : "border-2 border-[#F1F1F2]",
                            "flex items-center rounded-lg w-full lg:max-w-[420px] bg-[#F1F1F2] ",
                            ].join(" ")}
                        >
                            <input
                                onChange={(e) => setComment(e.target.value)}
                                onFocus={() => setInputFocussed(true)}
                                onBlur={() => setInputFocussed(false)}
                                className="bg-[#F1F1F2] tex-[14px] focus:outline-none w-full lg:max-w-[420px] p-2 rounded-lg"
                                type="text"
                                placeholder="Add a comment..."
                            />
                        </div>
                        <button
                            disabled={!comment}
                            onClick={addComment}
                            className={[
                                comment ? "text-[#F02C56] cursor-pointer" : "text-gray-400",
                                "font-semibold text-sm ml-5 pr-1",
                                ].join(" ")}
                            >
                            Post
                        </button>
                    </div>
                </div>
            </div>

    );
    
    
}

export default Post