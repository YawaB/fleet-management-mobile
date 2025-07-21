import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { _createTicket,  _fetchTicketReport,  _fetchTicketResults,  _fetchTickets, _fetchTicketsStatistics, _fetchTicketTemplate, _fetchTicketTypes, _removeTicket, _saveTicketResults, _updateTicket } from "../api/index";
import _ from 'lodash'
import moment from "moment";

const slice_name = "tickets"
export const fetchTickets = createAsyncThunk(`${slice_name}/fetchTickets`, async (_args, { dispatch, getState }) => {
  const res = await _fetchTickets(_args)
  if (Array.isArray(res.response)) dispatch(setTickets(res.response))
  return res.response
})

export const fetchTicketTypes = createAsyncThunk(`${slice_name}/fetchTicketTypes`, async (_args, { dispatch, getState }) => {
  console.log('ftech....')
  const res = await _fetchTicketTypes()
  console.log('ticketsty:', res);

  if (Array.isArray(res.response)) dispatch(setTicketTypes(res.response))
  return res.response
})

export const createOrUpdateTicket = createAsyncThunk(`${slice_name}/createOrUpdateTask`, async (_args, { dispatch, getState }) => {
  try {
    if (!_args) return
    
    let fetchAfter = _args?.fetchAfter
    delete _args?.fetchAfter
    let data = _.cloneDeep(_args)
    console.log('updatingggg:', data)
    let res = null

    if (!data.id)
      res = await _createTicket(data)
    else
      res = await _updateTicket(data)

    if (res.success && fetchAfter !== false) dispatch(fetchTickets())

    return res
  } catch (e) {
    
    return { error: true, message: e.message }
  }
})

export const removeTicket = createAsyncThunk(`${slice_name}/removeTicket`, async (_args, { dispatch, getState }) => {
  try{
    console.log('start removing...');
    const res = await _removeTicket(_args)
    console.log('resss:', res)
    if (res.success) dispatch(fetchTickets())
    return res
  }catch(e){
    console.log('Error:', e.message)
  }
})

export const fetchTicketTemplate = createAsyncThunk(`${slice_name}/fetchTicketTemplate`, async (ticket_type, { dispatch, getState }) => {
  const res = await _fetchTicketTemplate(ticket_type)
  return res
})

export const saveTicketResults = createAsyncThunk(`${slice_name}/saveTicketResults`, async (data, { dispatch, getState }) => {
  const res = await _saveTicketResults(data)
  return res
})

export const fetchTicketResults = createAsyncThunk(`${slice_name}/fetchTicketResults`, async (data, { dispatch, getState }) => {
  const res = await _fetchTicketResults(data)
  return res
})

export const fetchTicketsStatistics = createAsyncThunk(`${slice_name}/fetchTicketsStatistics`, async (_args, { dispatch, getState }) => {
  const res = await _fetchTicketsStatistics(_args)
  if (Array.isArray(res.response || res)) dispatch(setTicketsStatistics(res.response || res))
  return res.response || []
})


export const fetchTicketReport = createAsyncThunk(`${slice_name}/fetchTicketReport`, async (id, { dispatch, getState }) => {
  const res = await _fetchTicketReport(id)
  return res
})



export const getSelectedTicket = (state) => state[slice_name].selectedTicket;
export const getTickets = (state) => state[slice_name].tickets;
export const getTicketTypes = (state) => state[slice_name].tickettypes;
export const getTicketView = (state) => state[slice_name].view;
export const getEditTicket = (state) => state[slice_name].editTicket;
export const getTicketFilters = (state) => state[slice_name].filters;
export const getTicketsStatistics = (state) => state[slice_name].statistics;
export const getTicketDashboardFilters = (state) => state[slice_name].dashboard_filters;

export const ticketslice = createSlice({
  initialState: {
    tickets: [],
    tickettypes: [],
    selectedTicket: null,
    editTicket: false,
    view: 'list',
    dashboard_filters: {
      // startDate: moment().startOf('month').format('YYYY-MM-DD'),
      // endDate: moment().endOf('month').format('YYYY-MM-DD')
    },
    filters: {
      startDate: moment().startOf('month').format('YYYY-MM-DD'),
      endDate: moment().endOf('month').format('YYYY-MM-DD'),
    }
  },
  name: slice_name,
  reducers: {
      setTickets: (state, { payload }) => {
        state.tickets = payload
      },
      setTicketTypes: (state, { payload }) => {
        state.tickettypes = payload
      },
      setSelectedTicket: (state, { payload }) => {
        state.selectedTicket = payload
      },
      setEditTicket: (state, { payload }) => {
        state.editTicket = payload
      },
      setTicketView: (state, { payload }) => {
        state.view = payload
      },
      setTicketFilters(state, { payload }){
        state.filters = payload
      },
      setTicketsStatistics(state, { payload }){
        state.statistics = payload
      },
      setTicketDashboardFilter(state, { payload }){
        state.dashboard_filters = payload
      }
  }
});


export const {
    setTickets ,
    setTicketTypes,
    setSelectedTicket,
    setEditTicket,
    setTicketView,
    setTicketFilters,
    setTicketsStatistics,
    setTicketDashboardFilter
} = ticketslice.actions


export default ticketslice.reducer;


