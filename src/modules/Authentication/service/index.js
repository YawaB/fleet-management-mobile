import SqliteModule from "../../../core/modules/SqliteModule"
export async function updateLocalUser(user) {
    try {
        return await SqliteModule.updateLocalUser(user)
    } catch (e) {
        return { success: false, message: e.message }
    }
}

export async function getLocalUser() {
    try {
        return await SqliteModule.getLocalUser()
    } catch (e) {
        return { success: false, message: e.message }
    }
}