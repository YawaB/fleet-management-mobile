import { View, Text } from "react-native";
import { Divider, IconButton } from "react-native-paper";
import useLogger from "../../hook/Logger/useLogger.js";
import {  useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { clearLogs, fetchLogs, fetchLogTags, getLogTags } from "../../hook/Logger/slice/logger.slice.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ISelectDropdown from "../../component/Shared/ISelectDropdown/ISelectDropdown.js";
import InputComponent from "../../component/Shared/InputComponent/InputComponent.js";

function LoggerList() {
  const { LoggerComponent } = useLogger();
  const [device, setDevice] = useState(null);
  const [tag , setTag] = useState('')
  const logTags = useSelector(getLogTags)
  
  const dispatch = useDispatch();
  const clear = () => {
    dispatch(clearLogs([]));
  };

  const reload = () => {
    dispatch(fetchLogs([]));
  };

  const sendIdDevice = async () => {
    const deviceid = await AsyncStorage.getItem("deviceid");
    setDevice(deviceid);
  };

  useEffect(()=>{
    dispatch(fetchLogTags())
  },[])

  return (
    <View style={{ flex: 1, margin: 5, top: 30 }}>
      <View className="flex flex-row items-center justify-between">
        <View
          className="flex flex-row items-center"
        >
          <Text className="text-lg text-semibold">Logs</Text>
          {device && <Text className={"text-base"}>{device}</Text>}
        </View>
        <View
          className="flex-row items-center gap-2"
        >
          <ISelectDropdown onSelect={(tag)=> setTag(tag)} style={{height: 30 , width: 100 , backgroundColor: "#fff", padding: 0}}  placeholder={'Tag'} data={(logTags || []).map( t =>({label: t , value: t}))}  />
          <Ionicons
            onPress={reload}
            name="sync"
            size={20}
            style={{ fontWeight: 600 }}
            color="blue"
          />
          <Ionicons
            onPress={clear}
            name="trash-bin"
            size={20}
            color="red"
          />
        </View>
      </View>
      <Divider />
      <View className="mt-2">
        {/* <InputComponent /> */}
        <LoggerComponent tag={tag} />
      </View>
    </View>
  );
}

export default LoggerList;
