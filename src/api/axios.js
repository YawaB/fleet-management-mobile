import axios from 'axios'
import { API_BASE_URI } from './config'

console.log('baseurl:', API_BASE_URI)
const instance = axios.create({
    baseURL: API_BASE_URI,
    withCredentials: true
})

export default instance
