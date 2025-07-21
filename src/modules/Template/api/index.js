import { request } from "../../../api"

export async function _fetchTemplates(role) {
    return await request('templates/list?role='+role)
}

export async function _createTemplate(data) {
    delete data.id
    return await request(`templates/create`, {
        method: 'post',
        data
    })
}

export async function _updateTemplate(data) {
    const id = data.id
    delete data.id
    return await request(`templates/update`, {
        method: 'post',
        data,
        params: {id}
    })
}

export async function _removeTemplate(id) {
    return await request(`templates/delete` , {
        method: 'delete',
        params: {id}
    })
}
