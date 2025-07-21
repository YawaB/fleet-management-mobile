
export const CHECK_TABLE_NAME = 'CHECK_RESULT'
export const FILE_TABLE_NAME = 'FILES'

export const CHECK_TABLE = `
    CREATE TABLE IF NOT EXISTS ${CHECK_TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        temp_id integer, 
        item_id integer ,
        value text,
        comment text, 
        check_case text,
        ticket integer,
        text_1 text,
        text_2 text,
        text_3 text,
        text_4 text,
        text_5 text
    )
`

export const FILE_TABLE = `
    CREATE TABLE IF NOT EXISTS ${FILE_TABLE_NAME} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        srcObject text,
        srcId integer,
        srcParent text,
        srcParentId integer,
        itemObject text,
        itemId integer,
        name text,
        path text,
        base64 text,
        text_1 text,
        text_2 text,
        text_3 text,
        text_4 text,
        text_5 text
    )
`