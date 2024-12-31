import { useQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { GET_POSTS_BY_USER_ID } from '../graphql/queries/GetPostsByUserId';
import { GetLikedPostsByUserQuery, GetPostsByUserIdQuery, GetPostsQuery, GetUsersQuery } from '../gql/graphql';
import { useUserStore } from '../stores/userStore';
import MainLayout from '../layouts/MainLayout';
import { BsFillPencilFill } from 'react-icons/bs';
import { useGeneralStore } from '../stores/generalStore';
import { AiFillUnlock } from 'react-icons/ai';
import PostProfile from '../components/PostProfile';
import { GET_USERS } from '../graphql/queries/GetUsers';
import { GET_ALL_POSTS } from '../graphql/queries/GetPosts';
import { GET_LIKED_POSTS_BY_USER } from '../graphql/queries/GetLikedPostsByUser';

function Profile() {

    const {id} = useParams<{id: string}>();    
    const user = useUserStore((state) => state);
    const isEditProfileOpen = useGeneralStore((state) => state.isEditProfileOpen);
    const setIsEditProfileOpen = useGeneralStore((state) => state.setIsEditProfileOpen);
    const [showPosts, setShowPosts] = useState(true);

    const { data, loading, error } = useQuery<GetPostsByUserIdQuery>(GET_POSTS_BY_USER_ID, {
        variables: {
            userId: Number(id),
        },
    });

    const { data: dataUsers } = useQuery<GetUsersQuery>(GET_USERS);

    const { data: dataLikedPostsByUser } = useQuery<GetLikedPostsByUserQuery>(GET_LIKED_POSTS_BY_USER, {
        variables: {
            userId: Number(id),
            // fetchPolicy: 'cache-first'
        },
    });

    useEffect(() => {
        console.log('-------프로필 엑박 이미지 확인--------')
        console.log('user store의 user 확인');
        console.log(user);
    }, [id])

    return (
        <MainLayout>
            <div className="pt-[70px] w-full max-w-[690px] mx-auto">
                <div className="flex items-center mb-5">
                    <img
                        className="w-[100px] h-[100px] rounded-full object-cover"
                        src={
                            !user.image ? "https://picsum.photos/id/83/300/320" : user.image
                        }
                    />
                    <div className="ml-5">
                        <div className="text-[30px] font-bold truncate">{user.fullname}</div>
                        <div className="text-[18px] truncate">{user.bio}</div>
                        <button
                            onClick={setIsEditProfileOpen}
                            className="flex items-center rounded-md py-1.5 px-3.5 mt-3 text-[15px] font-semibold border hover:bg-gray-100"
                        >
                            <BsFillPencilFill size="18" className="mt-0.5 mr-1" />
                            <span>Edit Profile</span>
                        </button>
                    </div>
                </div>

                <div className="w-full flex items-center pt-2 mb-6">
                    <div 
                        onClick={()=>setShowPosts(prev => !prev)}
                        className={`w-60 text-center font-semibold text-[17px] cursor-pointer
                            ${showPosts ? `py-5 border-b-2` : `text-gray-500 py-2`}`
                        }>
                        {dataUsers?.getUsers.find(user => user.id === Number(id))?.fullname}'s Posts
                    </div>
                    <div
                        onClick={()=>setShowPosts(prev => !prev)}
                        className={`w-60 text-center font-semibold text-[17px] cursor-pointer
                            ${showPosts ? `text-gray-500 py-2` : `py-5 border-b-2`}`
                        }>
                        Likes
                    </div>
                </div>
                {showPosts ? 
                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3">
                        {data?.getPostsByUserId.map((post) => (
                            <PostProfile key={post.id} post={post} />
                        ))}
                    </div>
                :
                    <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3">
                        {dataLikedPostsByUser?.getLikedPostsByUser.map((post) => (
                            <PostProfile key={post.id} post={post} />
                        ))}
                    </div>
                }
            </div>
        </MainLayout>
    );
}

export default Profile