import axios from "axios";
import { EXPO_PUBLIC_REACT_APP_API } from "@env";
console.log("baseurl axios:", EXPO_PUBLIC_REACT_APP_API);
const instance = axios.create({
  baseURL: "http://192.168.11.107:5400/" //EXPO_PUBLIC_REACT_APP_API,
  // withCredentials: true
});

export default instance;
