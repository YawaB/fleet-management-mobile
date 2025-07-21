import { request } from "../../../api"

export async function _fetchMessages(filter) {
    return await request('messages/list' , {params: filter})
}

export async function _createMessage(data) {
    delete data.id
    return await request(`messages/create`, {
        method: 'post',
        data
    })
}

export async function _updateMessage(data) {
    const id = data.id
    delete data.id
    return await request(`messages/update`, {
        method: 'post',
        data,
        params:{id}
    })
}

export async function _removeMessage(id) {
    return await request(`messages/delete`, {
        params:{id},
        method: 'delete'
    })
}