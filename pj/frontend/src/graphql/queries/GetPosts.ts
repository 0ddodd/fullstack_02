import { gql } from "@apollo/client"

export const GET_ALL_POSTS = gql`
    query GetPosts($skip: Int!, $take: Int!, $keyword: String) {
        getPosts(skip: $skip, take: $take, keyword: $keyword) {
            id
            text
            video
            user {
                id
                fullname
                email
                image
            }
            likes {
                id
                userId
                postId
            }
        }
    }
`