// import { check, request, PERMISSIONS } from "react-native-permissions";
import Geolocation from "@react-native-community/geolocation";
import moment from "moment";
import { Alert, PermissionsAndroid } from "react-native";
import { toastMessage } from "../ui";
Geolocation.setRNConfiguration({
    // skipPermissionRequests: true,
});

const requestGelocationPermision = async () => {
    return await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        {
          title: 'Permission pour la geolocalisation',
          message:'Pour bien fonctionner cette application a besoin de la permission de geolocalisation',
        //   buttonNeutral: 'Plus tard',
          buttonNegative: 'Annuler',
          buttonPositive: 'OK',
        },
      );
    return await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION, {
      title: "Autorisation pour la localisation",
      message: "Test",
    });
};

export const requestGeolocationCurrentPosition = () => {
    log("start requestGeolocationCurrentPosition...");
    return new Promise(async (r) => {
      // let error = await requestForgroundPermission()
      // console.log('request pos:'+error)
      let permission = await requestGelocationPermision();

      if (permission == "blocked") {
        log("Location permission has been blocked");
        return {
          error: "Location permission has been blocked",
          granted: permission,
        };
      }

      const onSuccess = (position) => {
        log(
          `End requestGeolocationCurrentPosition ${JSON.stringify(
            position?.coords
          )}`
        );
        if (position?.coords) {
          position = {
            ...position.coords,
            timestamp: position.timestamp,
            mocked: position.mocked,
            speed: position.speed,
          };
        }

        console.log('positionnnnn:', position)
        r(position);
      };
      const onError = (error) => {
        toastMessage({
          text1: "Erreur localisation",
          text2: error.code == 2 ? "Veuillez activer votre localisation" : `Error requestGeolocationCurrentPosition:${error.message} - ${error.code}`,
          tag: 'location',
          type: 'error'
        })
        if(error.code == 2){
          Alert.alert("Erreur locatisation",error.code == 2 ? "Veuillez activer votre localisation" : `Error requestGeolocationCurrentPosition:${error.message} - ${error.code}`)
        }
        r(null);
      };
      Geolocation.getCurrentPosition(onSuccess, onError, {
        timeout: 5000,
      });
    });
};

function log(message){
    console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]: ${message}`)
}