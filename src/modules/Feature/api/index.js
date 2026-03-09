import { request } from "../../../api"

export async function _fetchfeatures(role) {
    return await request('features/list?role='+role)
}