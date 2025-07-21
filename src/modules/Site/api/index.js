import { request } from "../../../api"

export async function _fetchSites(role) {
    return await request('sites/list?role='+role)
}

export async function _createSite(data) {
    delete data.id
    return await request(`sites/create`, {
        method: 'post',
        data
    })
}

export async function _updateSite(data) {
    const id = data.id
    delete data.id
    return await request(`sites/update`, {
        method: 'post',
        data,
        params: {id}
    })
}

export async function _removeSite(id) {
    return await request(`sites/delete` , {
        method: 'delete',
        params: {id}
    })
}
