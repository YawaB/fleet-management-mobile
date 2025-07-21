import AsyncStorage from "@react-native-async-storage/async-storage";
import SqliteModule from "../../../core/modules/SqliteModule";
import { CHECK_TABLE, CHECK_TABLE_NAME, FILE_TABLE, FILE_TABLE_NAME } from "../constance";
import { saveLog } from "../../../hook/Logger/service";

let check_table = false
let file_table = false



export async function initializeChecksTables(){
   try{
        console.log('Start initializeChecksTables')
        saveLog({
            message: 'Start initializeChecksTables',
            type: 'info',
            tag: 'Checks'
        })
        await dropTableIfNewStructure(CHECK_TABLE_NAME, CHECK_TABLE)
        let check_res =  await SqliteModule.execSQL(CHECK_TABLE)
        check_table = check_res.success
        await dropTableIfNewStructure(FILE_TABLE_NAME, FILE_TABLE)
        let file_res =  await SqliteModule.execSQL(FILE_TABLE)
        file_table = file_res.success
        saveLog({
            message: 'End initializeChecksTables',
            type: 'info',
            tag: 'Checks'
        })
        console.log('End initializeChecksTables')
   }catch(e){
        saveLog({
            message: 'End initializeChecksTables',
            type: 'error',
            tag: 'Checks'
        })
        console.log('Error creating tables:', e.message)
   }
   return
}

export async function saveCheckResultsOffline(data){
    let response = {success: false, response: null}
    try{
        let item = data?.[0];
        console.log('START INSERTING CHECKS' , data , item)
        if(!item) {
            return { success: false, response: "Data is empty"}
        }
        let where = {
            temp_id: item.temp_id,
            ticket: item.ticket
        }
        let updateObj = {
            text_1: 'delete'
        }
        
        let update = await SqliteModule.update(CHECK_TABLE_NAME , where , updateObj);
        
        let response = await SqliteModule.bulkInsert(CHECK_TABLE_NAME, data)
        if(response.success) {
            let remove = await SqliteModule.delete(CHECK_TABLE_NAME , {...where , ...updateObj});
        }
    }catch(e){
        console.log('Error saving check result:', e.message)
        response = {success: false, response: e.message}
    }
    return response

}

export async function fetchCheckOfflineResults(filter){
    try{
        let response = await SqliteModule.select(CHECK_TABLE_NAME, filter , {
            columns: ['id', 'temp_id' , 'item_id' , 'ticket' , 'value', 'comment', 'check_case']
        });
        return response
    }catch(e){
        console.log('Error fetching check result:', e.message)
        return {success: false, response: e.message}
    }
}

export async function removeCheckImageOffline(filter){
    try{
        filter = filter || {};
        if(!isNaN(filter)) filter = {id: filter}

        if(Object.keys(filter).length == 0) return { success: false, response: "Filter is empty"}
        console.log('filter:', filter)
        return await SqliteModule.delete(FILE_TABLE_NAME, filter);
    }catch(e){
        console.log('Error removing check image:', e.message)
        return {success: false, response: e.message}
    }
}

export async function saveCheckImageOffline(data){
    try{
        let response = await SqliteModule.bulkInsert(FILE_TABLE_NAME, data)
        return response
    }catch(e){
        console.log('Error saving check image:', e.message)
        return {success: false, response: e.message}
    }
}

export async function fetchCheckImagesOffline(filter){
    try{
        let response = await SqliteModule.select(FILE_TABLE_NAME, filter , {
            columns: ['name:id',  'srcId:item_id', 'srcParentId:temp_id', 'itemId:ticket', 'name', 'path']
        });
        return response
    }catch(e){
        console.log('Error fetching check image:', e.message)
        return {success: false, response: e.message}
    }
}

async function dropTableIfNewStructure(tableName , newSql){
    let old = await AsyncStorage.getItem('table-'+tableName)
    if(old && old != newSql){
        await SqliteModule.execSQL(`drop table ${tableName}`)
    }
    return 
}