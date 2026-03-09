import { request } from './index'


export async function _fetchAreas(){
    return await request('areas/list')
}

export async function _fetchStatuses(){
    return await request('statuses/list')
}