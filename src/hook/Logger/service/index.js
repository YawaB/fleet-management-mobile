import moment from "moment";
import sqliteModule from "../../../core/modules/SqliteModule";

const tableName = 'Log'

export const createLogerTable = async ()=> {
    let response =  await sqliteModule.execSQL(`
            CREATE TABLE IF NOT EXISTS ${tableName}(
                id integer primary key autoincrement,
                [logAt] datetime,
                message text not null,
                type nvarchar(10),
                tag nvarchar(50),
                text_1 nvarchar(10),
                text_2 nvarchar(10),
                text_3 nvarchar(10),
                text_4 nvarchar(10),
                text_5 nvarchar(10)
            )
    `)
    if(response.success) console.log('Log table created successfully');
    else console.log('Error creating logger table:', response?.response);
    return response
}

export const getLogs = async (filter)=> {
    return await sqliteModule.execSQL(`select * from ${tableName} order by logAt desc`)
}

export const _getLogTags = async (filter)=> {
    return await sqliteModule.execSQL(`select distinct tag from ${tableName}`)
}

export const saveLog = async (log)=> {
    if(log) log.logAt = moment().format('YYYY-MM-DDTHH:mm:ss')
    return await sqliteModule.insert(tableName , log)
}

export const clearLogsTable = async ()=> {
    return await sqliteModule.clearTable(tableName)
}