import { request } from "../api";

export async function saveFcmToken(data){
    return await request('fcmtoken/save', {
        method: 'post',
        data
    })
}