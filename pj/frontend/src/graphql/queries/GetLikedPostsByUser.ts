import { gql } from "@apollo/client";

export const GET_LIKED_POSTS_BY_USER = gql`
    query GetLikedPostsByUser ($userId: Float!) {
        getLikedPostsByUser (userId: $userId) {
            id
            text
            video
        }
    } 
`;