import { useQuery } from '@apollo/client';
import React from 'react'
import { useParams } from 'react-router-dom'
import { GET_POSTS_BY_USER_ID } from '../graphql/queries/GetPostsByUserId';
import { GetPostsByUserIdQuery } from '../gql/graphql';
import { useUserStore } from '../stores/userStore';
import MainLayout from '../layouts/MainLayout';
import { BsFillPencilFill } from 'react-icons/bs';
import { useGeneralStore } from '../stores/generalStore';
import { AiFillUnlock } from 'react-icons/ai';
import PostProfile from '../components/PostProfile';

function Profile() {

    const {id} = useParams<{id: string}>();
    const { data, loading, error } = useQuery<GetPostsByUserIdQuery>(GET_POSTS_BY_USER_ID, {
        variables: {
            userId: Number(id),
        },
    });

    const user = useUserStore((state) => state);
    const isEditProfileOpen = useGeneralStore((state) => state.isEditProfileOpen);
    const setIsEditProfileOpen = useGeneralStore((state) => state.setIsEditProfileOpen);


    return (
        <MainLayout>
            <div className="pt-[90px] w-full max-w-[690px] mx-auto">
                <div className="flex items-center mb-5">
                    <img
                        className="w-[100px] h-[100px] rounded-full object-cover"
                        src={
                            !user.image ? "https://picsum.photos/id/83/300/320" : user.image
                        }
                    />
                    <div className="ml-5">
                        <div className="text-[30px] font-bold truncate">{user.fullname}</div>
                        <div className="text-[18px] truncate">{user.fullname}</div>
                        <button
                            onClick={setIsEditProfileOpen}
                            className="flex items-center rounded-md py-1.5 px-3.5 mt-3 text-[15px] font-semibold border hover:bg-gray-100"
                        >
                            <BsFillPencilFill size="18" className="mt-0.5 mr-1" />
                            <span>Edit Profile</span>
                        </button>
                    </div>
                </div>

                <div className="w-full flex items-center pt-2 border-b mb-6">
                    <div className="w-60 text-center py-5 text-[17px] font-semibold border-b-2">
                        Posts
                    </div>
                    <div className="w-60 text-gray-500 text-center py-2 text-[17px] font-semibold">
                        {/* <AiFillUnlock className="mb-0.5" />
                        Liked */}
                    </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-3">
                    {data?.getPostsByUserId.map((post) => (
                        <PostProfile key={post.id} post={post} />
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}

export default Profile