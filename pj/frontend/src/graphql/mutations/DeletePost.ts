import { gql } from "@apollo/client";

export const DELETE_POST = gql`
    mutation DeletePost($id: Float!) {
        deletePost(id: $id) {  
            id
        }
    }
`;