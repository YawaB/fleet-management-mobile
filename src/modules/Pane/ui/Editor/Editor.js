import React, { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, Image } from 'react-native'
import { TextInput, Button, Text, SegmentedButtons, Divider, IconButton } from 'react-native-paper'
import { Dropdown } from 'react-native-element-dropdown'
import * as ImagePicker from 'expo-image-picker'
import CameraScreen from '../../../../component/Shared/CameraScreen/CameraScreen'
import { createOrUpdatePanne, fetchPanneTypes, fetchVehicles, getPanneTypes, getVehicles } from '../../slice/panne.slice'
import { useDispatch, useSelector } from 'react-redux'

function PaneEditor({ navigation }) {
  const [formData, setFormData] = useState({
    immatriculation: '',
    category: '',
    symptom: '',
    isImmobilizing: 'non',
    description: '',
    photo: null
  })
  const [categoryFocus, setCategoryFocus] = useState(false)
  const [symptomFocus, setSymptomFocus] = useState(false)

  const dispatch = useDispatch()

  const vehicles = useSelector(getVehicles)
  const panneTypes = useSelector(getPanneTypes)



  const symptoms = {
    '280': ['Ne démarre pas', 'Bruit anormal', 'Perte de puissance'], // mécanique
    '281': ['Batterie faible', 'Éclairage défectueux'], // electrique
    '300': ['Chocs visibles', 'Portière bloquée', 'Rayures profondes'], // carrosserie
    '303': ['Pression basse', 'Bruit de roulement', 'Usure irrégulière'], // pneumatique
    '304': ['Autre problème détecté', 'Symptôme non identifié'] // autre
  };

  console.log("formData", formData)

  const handleSave = () => {
    let args =  {
      "id":0,
      "vehiculeId" :formData.immatriculation,
      "CategoryTypeId" : formData.category,
      "Symptome" : formData.symptom,
      "Description" : formData.description,
      "panneImmobilisante" : formData.isImmobilizing,
    }
    console.log("args handleSave", args)
    dispatch(createOrUpdatePanne(args)).then(({payload})=>{
      if(payload){
        setFormData({
          immatriculation: '',
          category: '',
          symptom: '',
          isImmobilizing: 'non',
          description: '',
          photo: null
        })
        navigation.goBack()
      }
    })
    // TODO: Implement save functionality
  }

  const handlePhotoUpload = async (type) => {
    if (type === 'camera') {
      navigation.navigate('CameraScreen')
    }
  }

  useEffect(() => {
    dispatch(fetchVehicles());
    dispatch(fetchPanneTypes());
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>

      <View className="flex flex-col gap-1">
        <View className="flex flex-col ">
        <Text className="text-gray-500 font-bold pb-1">N° Immatriculation</Text>
        <Dropdown
          style={[styles.dropdown, categoryFocus && { borderColor: '#f97316' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={vehicles}
          maxHeight={300}
          labelField="licensePlate"
          valueField="id"
          search
          placeholder="Immatriculation"
          value={formData.immatriculation}
          onFocus={() => setCategoryFocus(true)}
          onBlur={() => setCategoryFocus(false)}
          onChange={item => {
            setFormData({ ...formData, immatriculation: item.id })
            setCategoryFocus(false)
          }}
        />
        </View>
        <View className="flex flex-col">
        <Text className="text-gray-500 font-bold pb-1">Catégorie</Text>
        <Dropdown
          style={[styles.dropdown, categoryFocus && { borderColor: '#f97316' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={panneTypes}
          maxHeight={300}
          labelField="label"
          valueField="uid"
          placeholder={!categoryFocus ? 'Catégorie de la panne' : '...'}
          value={formData.category}
          onFocus={() => setCategoryFocus(true)}
          onBlur={() => setCategoryFocus(false)}
          onChange={item => {
            console.log("item Dropdown", item)
            setFormData({ ...formData, category: item.uid, symptom: '' })
            setCategoryFocus(false)
          }}
        />
        </View>
        <View className="flex flex-col">
        <Text className="text-gray-500 font-bold pb-1">Symptômes</Text>
        <Dropdown
          style={[styles.dropdown, symptomFocus && { borderColor: '#f97316' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={formData.category ? symptoms[formData.category].map(symptom => ({ label: symptom, value: symptom })) : []}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!symptomFocus ? 'Symptômes de la panne' : '...'}
          value={formData.symptom}
          onFocus={() => setSymptomFocus(true)}
          onBlur={() => setSymptomFocus(false)}
          onChange={item => {
            setFormData({ ...formData, symptom: item.value })
            setSymptomFocus(false)
          }}
          disable={!formData.category}
        />
        </View>
        <View className="flex flex-col">
        <Text className="text-gray-500 font-bold pb-1">Panne immobilisante ?</Text>
        <SegmentedButtons
          value={formData.isImmobilizing}
          onValueChange={value => setFormData({ ...formData, isImmobilizing: value })}
          buttons={[
            { value: 'oui', label: 'Oui' },
            { value: 'non', label: 'Non' }
          ]}
          style={styles.segmentedButton}
        />
        </View>
        <View className="flex flex-col">
        <Text className="text-gray-500 font-bold pb-1">Descriptif de la panne</Text>
        <TextInput
          mode="outlined"
          label="Descriptif de la panne"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={4}
          style={styles.input}
        />
        </View>
          <Text className="text-gray-500 font-bold pb-1">Photo</Text>
        <Divider />
        {formData.photo ? (
          <View style={styles.photoPreviewContainer}>
            <Image 
              source={{ uri: formData.photo.uri }} 
              style={styles.photoPreview} 
              resizeMode="cover"
            />
            <IconButton
              icon="close-circle"
              size={24}
              style={styles.removePhotoButton}
              onPress={() => setFormData(prev => ({ ...prev, photo: null }))}
            />
          </View>
        ) : (
          <View className="flex justify-between flex-row">
            <Button
              mode="text"
              onPress={() => handlePhotoUpload('album')}
              icon="image-multiple-outline"
              style={styles.photoButton}>
              Album
            </Button>
            <Button
              mode="text"
              onPress={() => handlePhotoUpload('camera')}
              icon="camera"
              style={styles.photoButton}>
             Prendre une photo
            </Button>
          </View>
        )}
        </View>
      </ScrollView>
        <View style={{marginHorizontal: 16}} className="flex absolute bottom-0 left-0 right-0">
            <Button
              mode="contained"
              onPress={handleSave}
              icon="content-save-all"
              style={styles.photoButton}
            >
              Enregistrer
            </Button>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: 'white'
  },
  placeholderStyle: {
    fontSize: 16,
    color: 'gray'
  },
  selectedTextStyle: {
    fontSize: 16
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  content: {
    marginTop: 16,
    padding: 16,
  },
  input: {
    marginBottom: 16
  },
  label: {
    marginBottom: 8
  },
  segmentedButton: {
    marginBottom: 16
  },
  photoButton: {
    marginTop: 8,
    marginBottom: 24,
  }
})

export default PaneEditor