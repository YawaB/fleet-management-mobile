import { StyleSheet, Text, View , Image, ImageBackground } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Button, Switch, TextInput } from 'react-native-paper'
import Styles  from '../../../styles/index'
import bgImage from '../../../../assets/ATS_LOGO_lg.png'
import { checkUser, login } from '../slice/auth.slice'
import { useDispatch } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage'
import LoadingComponent from '../../../component/Shared/LoadingComponent/LoadingComponent'
import { toastMessage } from '../../../core/ui'
import { getLocalUser, updateLocalUser } from '../service'
import useLogger from '../../../hook/Logger/useLogger'
const mandatories = ['email' , 'password']

const AuthenticationScreen = ({navigation , route}) => {
  const [credentials , setCredentials] = useState({email: '' , password: ''})
  const [rememberMe , setRememberMe] = useState(false)
  const [ready , setReady ] = useState(false)
  const [loading , setLoading ] = useState(false)
  const [isCheckingUser , setIsCheckingUser] = useState(false)

  const { log } = useLogger()
  const dispatch = useDispatch();
  const goToFeatures = ()=>{
    navigation.navigate('Features', {
      from: 'auth'
    })
    setIsCheckingUser(false)
  }
  const onCredentials = (k , v)=> {
      setCredentials( o => ({...o , [k]: v}) )
  }
  const Login = async ()=> {
       try{
        goToFeatures()
        return
          setLoading(true)
          setReady(false)
          const result = await dispatch(login(credentials))
          console.log({result})
          console.log('response:,', result.payload.response)
          if(!result.payload?.success)
            throw new Error(result.payload.response)
          else{
            goToFeatures()
            updateLocalUser({
              login: credentials.email,
              password: credentials.password,
              active: rememberMe ? 1 : 0 
            }).then(r => {
              console.log('local user updated:', r)
              setCredentialFromLocal()
            })
          }
       }catch(e){
         toastMessage({
          type: "error",
          text1: "Authentification",
          text2: e.message,
          visibilityTime: 3000,
          tag: "authentication"
        })
        log(`[authentication] - ${e.message}`, 'error')
       }finally{
         setLoading(false)
         setReady(true)
       }
  }

  const setCredentialFromLocal = async ()=>{
      try{
        let response = await getLocalUser()
        console.log('user:', response)
        let user = response.response
        if(response.success && user && user?.active == 1){
          setCredentials({email: user.login , password: user.password })//, password: user.password
          setRememberMe(true)
        }
      }catch(e){

      }
  }

  useEffect(() => {
    return
     AsyncStorage.getItem('token').then(token =>{
      if(token){
        setIsCheckingUser(true)
        dispatch(checkUser())
        .then( ({payload})=>{
          if(payload) goToFeatures()
          setTimeout(()=>setIsCheckingUser(false) , 2000)
        })
      }else{
        setIsCheckingUser(false)
      }
    })
    setCredentialFromLocal()
  }, [route])

  useEffect(()=> {
    let r = true
       for(const k  of mandatories){
          if(credentials[k] === '') {
            r = false
            break
          }
       }
       setReady(r)
  }, [credentials])

  return (
    isCheckingUser ? <LoadingComponent label={'CONNEXION...'}  style={{backgroundColor: '#f97316'}} iconColor="#fff"/>
    : (
      <View  style={{flex: 1}} className="bg-white">
          <View style={{flex: 1 }} className="justify-center items-center">
                <Text className="font-semibold text-gray-500" style={{fontSize: 30}}>
                   {/* {APP_NAME} */}
                </Text>

                <Image source={bgImage} style={{width: 400 , height: 100}} />
                <Text className="text-orange-600">
                  {/* Le future commence maintenant */}
                </Text>
          </View>
          <View className="bg-orange-500 rounded-t-2xl p-2" style={{flex: 1 , justifyContent: 'center' , alignItems: 'center', elevation: 4}}>
              <View style={{width: '80%' ,height: 400, flexDirection: 'column', }} className="justify-center">
                <View >
                    <View style={Styles.mb20}>
                        <Text style={[Styles.h1]} className="text-white">Authentification</Text>
                    </View>
                    <View style={{flexDirection: 'column'}} >
                        <TextInput className="bg-white" left={<TextInput.Icon icon='email' />}  label='Email'  value={credentials?.email} onChangeText={(val) => onCredentials('email', val)}/>
                        <View className="mt-2">
                          <TextInput className="bg-white"  left={<TextInput.Icon icon='lock' />} label='Mot de passe' secureTextEntry value={credentials?.password} onChangeText={(val) => onCredentials('password', val)}/>
                        </View>
                    </View>
                    <View className="flex-row items-center justify-between mt-2 mb-2">
                        <Text className="text-white font-semibold">Sauvegarder mes informations</Text>
                        <Switch value={rememberMe} onValueChange={(val) => setRememberMe(val)} color={'#000'} />
                    </View>
                    <Button  className="bg-gray-600" contentStyle={{height: 60}} elevation={4} disabled={!ready} onPress={Login} style={[Styles.my20]} labelStyle={{fontSize: 17}} loading={loading} mode='contained'>CONNEXION</Button>
                </View>
              </View>
          </View>
        </View>
    )
  )
}

export default AuthenticationScreen

const styles = StyleSheet.create({})