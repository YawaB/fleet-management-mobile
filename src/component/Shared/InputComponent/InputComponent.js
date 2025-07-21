import React from 'react'
import { TextInput  } from 'react-native-paper'
import { STYLE } from '../../../core/style'

let defaultStyle = {
    outlineColor:'#ccc' ,
    mode:'outlined'
}
function InputComponent(props) {
  const onChangeText = (text)=>{
    if(props.type == 'number' && (text != '' && isNaN(text))) return;
    if(typeof props?.onChangeText == 'function') props.onChangeText(text)
  }
  return (
    <TextInput  outlineColor='#ccc' mode='outlined' {...props} className={`bg-white ${props.className}`} style={{height: STYLE.inputs.height || 50  , ...(props?.style || {}) , width: props?.style?.width || 'auto' }} onChangeText={onChangeText} />
  )
}

export default InputComponent