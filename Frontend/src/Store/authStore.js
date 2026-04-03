import { create } from 'zustand'
import axios from 'axios'


export const userAuth = create((set) => ({
    currentUser: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    login: async (userCredWithRole) => {
        try {
            // set loading true
            set({ loading: true, error: null })

            // make api call
            let res = await axios.post("http://localhost:4000/common-api/login", userCredWithRole, { withCredentials: true })
            // console.log("res is ", res)

            // if invalid login cred
            if (res.data.message == 'error') {
                // update state
                set({
                    loading: false,
                    isAuthenticated: false,
                    currentUser: res?.data
                })
            }
            else {
                // update state 
                set({
                    loading: false,
                    isAuthenticated: true,
                    currentUser: res?.data.payload
                })
            }

        } catch (error) {
            console.log("err is ", error)
            set({
                loading: false,
                isAuthenticated: false,
                currentUser: null,
                // error: error
                error: error.response?.data.error || "Login failed"
            })
        }

    },
    logout: async () => {
        try {
            // set loading state
            set({ loading: true, error: null })

            // make logout api req
            await axios.get("http://localhost:4000/common-api/logout", { withCredentials: true })

            // update state
            set({
                loading: false,
                isAuthenticated: false,
                currentUser: null
            })

        } catch (error) {
            console.log("err is ", error)
            set({
                loading: false,
                isAuthenticated: false,
                currentUser: null
            })
        }
    },
    checkAuth: async () => {
        try {
            // set loading state
            set({ loading: true, error: null })

            // make api req
            let res = await axios.get("http://localhost:4000/common-api/check-auth", { withCredentials: true })

            // update state 
            set({
                loading: false,
                isAuthenticated: true,
                currentUser: res.data.payload
            })
        } catch (error) {
            console.log("err is ", error)
            set({
                loading: false,
                isAuthenticated: false,
                currentUser: null,
                // error: error
                error: error.response?.data.error || "Login failed"
            })
        }
    }
}))