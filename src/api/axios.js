import axios from "axios";
import { EXPO_PUBLIC_REACT_APP_API } from "@env";
console.log("baseurl axios:", EXPO_PUBLIC_REACT_APP_API);
const instance = axios.create({
  baseURL: EXPO_PUBLIC_REACT_APP_API,
  // withCredentials: true
});

export default instance;
