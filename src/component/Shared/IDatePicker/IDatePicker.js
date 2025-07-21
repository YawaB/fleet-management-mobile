import React from 'react'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { TouchableOpacity , Text } from 'react-native'
import { STYLE } from '../../../core/style';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import MonthPicker from 'react-native-month-year-picker';

function IDatePicker({value , onChange , format , style , className , defaultStyle , mode}) {
  let [showMonthPicker , setShowMonthPicker] = React.useState(false)
  let _formatDate = ()=>{
        let date = null;
        if(value){
            date = moment(value).format(format || 'DD/MM/YYYY')  //formatDate(value , {format: format || 'DD/MM/YYYY'})
        }
        return date
  }

  const getValue = ()=>{
    if(!value) return new Date()
    if(value instanceof Date) return value
    return moment(value).toDate()
  }

  const onChangeDate = (e, val)=>{
    setShowMonthPicker(false)
    if(typeof onChange == 'function') onChange(val)
  }
  const showMode = (currentMode) => {
      if(mode == 'month'){
        setShowMonthPicker(true)
        return
      }
      
      DateTimePickerAndroid.open({
        value: getValue(),
        onChange:onChangeDate,
        mode: currentMode,
        is24Hour: true,
      });
   };
  return (
    <TouchableOpacity  style={{height: STYLE.inputs.height ,...(style || {})}} onPress={showMode} className={`flex-row items-center justify-between ${defaultStyle !== false ? STYLE.inputs.class: ''} ${className ? className : ''}`}>
        <Text> {_formatDate()} </Text>
        <Ionicons name="calendar" size={14} color="blue" />
        {showMonthPicker && (
          <MonthPicker
            onChange={onChangeDate}
            value={getValue()}
            locale="fr"
            cancelButton='Fermer'
            okButton='Selectioner'
            autoTheme={true}
          />
        )}
    </TouchableOpacity>
  )
}

export default IDatePicker