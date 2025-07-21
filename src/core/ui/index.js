import Toast from "react-native-toast-message";
import { saveLog } from "../../hook/Logger/service";

export function toastMessage(options){
    try{
        Toast.show({
            type: 'success',
            position: 'top',
            visibilityTime: 2000,
            autoHide: true,
            topOffset: 50,
            text1Style: {
                fontSize: 16,
            },
            text2Style: {
                fontSize: 15,
            },
            bottomOffset: 40,
            onShow: () => {},
            onHide: () => {},
            onPress: () => {},
            ...(options || {}),
            props: {}
        });

        let obj = { message:`[${options?.tag || options?.text1}] - ${options?.text2}`, type: options?.type || 'info' , tag: (options?.tag || '').toString() }
        saveLog(obj)
    }catch(e){
        console.log('Error showing toast:', e.message)
    }
}