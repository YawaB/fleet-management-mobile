import axios from 'axios'

console.log('baseurl axios:', process.env.EXPO_PUBLIC_REACT_APP_API)
const instance = axios.create({
    baseURL: process.env.EXPO_PUBLIC_REACT_APP_API,
    // withCredentials: true
})

export default instance
