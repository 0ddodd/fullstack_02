import { gql } from "@apollo/client";

export const SEARCH_POSTS = gql`
    query SearchPosts($keyword: String!) {
        searchPosts (keyword: $keyword) {
            id
            text
            video
            createdAt
            user {
                id
                email
                fullname
                image
            }
            likes {
                id
                userId
                postId
            }
        }
    }
`;