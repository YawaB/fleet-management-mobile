import { Dialog, Portal } from 'react-native-paper'
import { Image ,ScrollView,Text, TouchableOpacity, View } from 'react-native'
import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

function ImageContainerComponent(props) {
  let [visible , setVisible] = useState(false)
  let [modalImage, setModalImage ] = useState(null);

  useEffect(()=>{
    if(props?.source?.uri){
      setModalImage(props.source.uri)
    }
  }, [props?.source?.uri])
  return (
    <View {...props} style={{width: props.width ||0 , height: props.height || 0}}>
        <TouchableOpacity onPress={e=> setVisible(true)}  style={{width: '100%' , height: '100%'}}>
           <Image {...props} width={'100%'} height={'100%'}/>
          {
           typeof props.onRemove == 'function' && (
            <TouchableOpacity onPress={e => props.onRemove()}  className="absolute -top-1 -right-4" >
             <Ionicons name='close-circle' size={props?.deleteIconSize || 30} color={'red'} />
            </TouchableOpacity>
           ) 
          } 
        </TouchableOpacity>
        <Portal>
            <Dialog className="bg-white" visible={visible} onDismiss={e => setVisible(false)}>
                <View className="items-end px-2">
                    <Ionicons onPress={e=> setVisible(false)} name='close-circle' size={30} color={'red'} />
                </View>
                {Array.isArray(props?.images) && props?.images??.length > 1 && (
                    <ScrollView horizontal className="w-full p-2">
                        {props?.images?.map((img , idx)=>(
                            <TouchableOpacity key={idx} className="mx-1" onPress={e=> setModalImage(img)}  >
                                <Image source={{uri: img}} width={70} height={70}/>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
                <View style={{height: 300}} className="p-4">
                    <Image source={{uri: modalImage}}  width={'100%'} height={'100%'}/>
                </View>
            </Dialog>
        </Portal>
    </View>
  )
}

export default ImageContainerComponent