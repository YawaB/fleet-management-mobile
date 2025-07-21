import { request } from "../api";

export async function saveFcmToken(data){
    return await request('fcmtokens/create', {
        method: 'post',
        data
    })
}