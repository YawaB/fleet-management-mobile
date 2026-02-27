import axios from "axios";
import { EXPO_PUBLIC_REACT_APP_API } from "@env";

const instance = axios.create({
  baseURL: EXPO_PUBLIC_REACT_APP_API, //EXPO_PUBLIC_REACT_APP_API,//"http://192.168.11.107:5400/" //
  // withCredentials: true
});

export const globalInstance = axios.create({
  baseURL: EXPO_PUBLIC_REACT_APP_API,
  withCredentials: true,
});

export default instance;
