import AsyncStorage from "@react-native-async-storage/async-storage"
import { Alert } from "react-native"
import { navigate } from "../../../core/utils/navigation"

export async function logoutWithAlert(){
    await AsyncStorage.removeItem('token')
    Alert.alert('Session expirée', 'Votre session a expirée. Vous devrier vous reconnecter', [
        {
            text: 'Connexion',
            onPress: () => navigate('Login' , {
                from: 'session-expired'
            })
        }
    ])
}