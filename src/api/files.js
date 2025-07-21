import { result } from "lodash"
import * as xlsx from "xlsx"
import _ from 'lodash'
export async function FilesToBase64(files) {
    try {
        let output = []
        for (let f of files) {
            let r = await fileToBase64(f)

            output.push(r)
        }
        return output
    } catch (ex) {
        console.log('error:', ex.message)
        return { success: false, result: ex.message }
    }
}

const fileToBase64 = async (file) => {
    try {
        return new Promise((rs, rj) => {
            const index = file.name.lastIndexOf('.');
            let extension = file.name.slice(index + 1)
            let reader = new FileReader();
            reader.onload = function () {
                rs({
                    success: true, result: {
                        filePath: reader.result,
                        extension,
                        fileType: file.type
                    }
                })
            }
            reader.readAsDataURL(file)
        })
    } catch (ex) {
        console.log('error:', ex.message)
        return { success: false, result: ex.message }
    }

}

const convertFile = async (file , type='base64') => {
    const types = {
        'base64': 'readAsDataURL',
        'buffer': 'readAsArrayBuffer'
    }
    return new Promise((rs, rj) => {
        try{
            if(!types[type]) throw new Error('Format specified not exist !!')
            const index = file.name.lastIndexOf('.');
            let extension = file.name.slice(index + 1)
            let reader = new FileReader();
            reader.onload = function () {
                rs({
                    success: true, result: {
                        filePath: reader.result,
                        extension,
                        fileType: file.type
                    }
                })
            }
            reader[types[type]](file)
        }catch (ex) {
            console.log('error:', ex.message)
            rs({ success: false, result: ex.message }) 
        }
    })
}

export async function convertXlsxToJson(file){
    let f = await convertFile(file, 'buffer');

    let data = [];
    if(f.success) {
        let wb = xlsx.read(f.result.filePath , {type: 'buffer'});

        for( const  key in wb.Sheets){
            data.push({
                sheet: key,
                data: xlsx.utils.sheet_to_json(wb.Sheets[key]),
                sheetStream: wb.Sheets[key],
            })
        }
    }
    return data;
    
}

export  function reformatNetGeoData(data){
     let fields = [
        "Distance", 
        "Longueur" , 
        'Elément réseau' , 
        'Description' , 
        'Caractéristiques',
        'Connexion' 
    ]
     if(!Array.isArray(data)) return data
     let index = data.findIndex( ( r )=> r.__EMPTY == 'Distance' || r.__EMPTY_1 == 'Longueur')
     
     data = data.slice(index);
     let headers = data[0];
     data = data.slice(1);
     let output = [];
     for( const dt of data){
        let obj = {};
        for( const key in headers){
            obj[headers[key]] = dt[key];
        }
        output.push(obj)
     }

     let out = {};

     for( const key in headers){
        if(fields.includes(headers[key]))
          out[headers[key]] = output.map( o => o[headers[key]] || "");
     }

     return out
}


export function reformatPlanCaseetteData (data , options){
    if(!options) options = {type: 'boxPlanVerifier'}
    if(!Array.isArray(data)) return false;
    let success = true;
    let error = ''
    let output = data.reduce((c , val)=>{
        let filter = null;
        if(val.sheet == 'Liste des cassettes')
         filter = ["Position" ,"Capacité" ,"Lovage"] 
        else if (val.sheet == 'Liste des routes Telecom')
         filter = ["Cassette", "Position" , "Route", "Etat"]
        else if( ['boxPlanVerifier'].includes(options.type) && val.sheet.includes('Détails du contenant'))
          filter = ["Nom" , "Capacité" , "Nb de tubes"]

        if(filter){
            let result = c[val.sheet] = reformatDataWithCriteria(val.data , filter , options?.keys?.[val.sheet]);

            if(result.length == 0) {
                success = false;
                error = `La feuille ${val.sheet} est inexistante`;
            }
            c[val.sheet] = reformatAsArrayValues(result)
        }
        return c;
    }, {}) 
    
    return { success , error , response: output }
}


function reformatDataWithCriteria(data , matchKeys , includeKeys){
    console.log('dataaa:', data , matchKeys)
    if(!data[0]) return data

    if(!Object.keys(data[0]).find( k => k.charAt(0) == '_')) return data
    let index = data.findIndex( ( r , index)=> {
        return matchKeys.every( s => Object.values(r).includes(s))
    })
    
    data = data.slice(index);

    console.log('dataaa22:',index, data)

    let headers = data[0];
    let keys = Object.keys(headers)
    data = data.slice(1);
    let output = [];
    let headers_group = {};

    for(let [key , val] of Object.entries(headers)){
        if(!headers_group[val]) headers_group[val] = [];
        headers_group[val].push(val);
        if(headers_group[val].length > 1) headers[key] = val+"."+(headers_group[val].length - 1)
    }
   
    let isArray = Array.isArray(includeKeys)
    for( const dt of data){
        let obj = {};
        for(const key of keys){
            obj[headers[key]] = dt[key];

            if(isArray){
              if(!includeKeys.includes(headers[key].split('.')[0])) delete obj[headers[key]]
            }
        }
        output.push(obj)
    }

    return output
}


export function reformatAsArrayValues(data , fields){
   
    let dt = data[0];

    if(!dt) return {};

    if(!fields) {
        fields = data.reduce( (c , v)=> {
            Object.keys(v).forEach( o => {
                if(!c.includes(o)) c.push(o)
            })
            return c
        }, [])
    } 
    let output = data.reduce((c , val)=> {
        for( const key of fields){
            if(c[key] == undefined) c[key] = [];
            c[key].push( val[key] || "")
        }
        return c
    }, {})
     
    return output
}


export function extractDataByRowAndCell(sheet, search){
    let output = {};
    // if(!Array.isArray(search)) return output

    // let cells = ['A', 'B' , 'C' , 'D' , 'E' , 'F' , 'G' , 'H' , 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    for( let s of search){
        let split = s.split(':');
        let col_row = split[0].toUpperCase();
        let colLabel = split[1] || col_row;        
        output[colLabel] = sheet?.[col_row]?.v || ''
    }

    return output
}