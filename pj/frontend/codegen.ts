import { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
    schema: "https://vpu.onrender.com/graphql",
    documents: ["src/graphql/**/*.ts"],
    ignoreNoDocuments: true,
    generates: {
        "./src/gql/": {
            preset: "client",
            plugins: [
                "typescript",
                "typescript-operations",
                "typescript-react-apollo",
            ],
            // config: {
            //     withHooks: true,
            //     withHOC: false,
            //     withComponent: false,
            // },
        },
    },
}

export default config