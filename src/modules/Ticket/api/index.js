import { request } from "../../../api"

export async function _fetchTickets(filter) {
    return await request('tickets/list' , {
        params:filter
    })
}

export async function _fetchTicketTypes(role) {
    return await request('tickettypes/list')
}

export async function _createTicket(data) {
    delete data.id
    return await request(`tickets/create`, {
        method: 'post',
        data
    })
}

export async function _updateTicket(data) {
    const id = data.id
    delete data.id
    return await request(`tickets/update`, {
        method: 'post',
        data,
        params: {id}
    })
}

export async function _removeTicket(id) {
    return await request(`tickets/delete` , {
        method: 'delete',
        params: {id}
    })
}


export async function _fetchTicketTemplate(ticket_type){
    return await request(`tickettemplates/list`, {
        params: {ticket_type}
    })
}

export async function _saveTicketResults(data){
    return await request(`ticketresults/create`, {
        method: 'POST',
        data
    })
}

export async function _fetchTicketResults(ticketId){
    return await request(`ticketresults/list`, {
        params: {ticketId}
    })
}

export async function _fetchTicketsStatistics(filter) {
    return await request('tickets/statistics', {params: filter})
}

export async function _fetchTicketReport(ticketId){
    return await request(`tickets/report`, {
        params: {id: ticketId}
    })
}