import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Feed from './pages/Feed.tsx'
import Upload from './pages/Upload.tsx'
import Profile from './pages/Profile.tsx'
import Post from './pages/Post.tsx'
import ProtectedRoutes from './components/ProtectedRoutes.tsx'
import { ApolloProvider } from '@apollo/client'
import { client } from './utils/apolloClient.ts'
import './styles/color.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <Feed />
      </ProtectedRoutes>
    )
  },
  {
    path: "/upload",
    element: <Upload />
  },
  {
    path: "/profile/:id",
    element: <Profile />
  },
  {
    path: "/post/:id",
    element: <Post />
  },
]);

createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
    <RouterProvider router={router}/>
    <App />
  </ApolloProvider>
)
