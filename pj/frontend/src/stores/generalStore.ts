import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

export interface GeneralState {
    isLoginOpen: boolean
    isEditProfileOpen: boolean
    selectedPosts: null
    ids: null
    posts: null
    searchKeyword: string
}

export interface GeneralActions {
    setLoginIsOpen: (isLoginOpen: boolean) => void
    setIsEditProfileOpen: () => void
    setSearchKeyword: (keyword: string) => void
}

export const useGeneralStore = create<GeneralState & GeneralActions>()(
    devtools(
        persist((set) => ({
            isLoginOpen: false,
            isEditProfileOpen: false,
            selectedPosts: null,
            ids: null,
            posts: null,
            searchKeyword: "",
            setLoginIsOpen: (isLoginOpen: boolean) => {
                set({ isLoginOpen })
            },
            setIsEditProfileOpen: () => {
                return set((state) => ({
                    isEditProfileOpen: !state.isEditProfileOpen
                }))
            },
            setSearchKeyword: (keyword: string) => {
                set({searchKeyword: keyword})
            }
        }),
        {
            name: "general-storage",
        })
    )
)