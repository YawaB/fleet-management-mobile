import React, { useEffect, useState } from "react";
import moment from "moment";
import { FlatList, TouchableOpacity, View, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchLogs, getMessages, getTableIsCreated, setMessage, setTableIsCreated } from "./slice/logger.slice";
import { createLogerTable, saveLog } from "./service";
function useLogger() {
  const logs = useSelector(getMessages);
  const table_is_created = useSelector(getTableIsCreated);
  const dispatch = useDispatch();
  const log = (message, type = "INFO" , tag) => {
    dispatch(setMessage({ message, type , logAt: moment().format('YYYY-MM-DDTHH:mm:ss') }));
    saveLog({ message, type ,tag: tag || '' ,logAt: moment().format('YYYY-MM-DDTHH:mm:ss') });
  };
  const logToFile = (message, type) => {};
  useEffect(() => {
    console.log('table_is_created:',table_is_created)
    if(!table_is_created){
      createLogerTable().then((response)=>{
        console.log('response:', response)
        if(!response?.success)
          log('[loger table] - Logger table created:'+response?.success, 'INFO')
        setTableIsCreated(response?.success)
      }).catch((e)=>{
          log('Error creating logger table:'+e, 'ERROR')
          setTableIsCreated(false)
      })
    }
    dispatch(fetchLogs());
  }, []);
  const LoggerComponent = ({tag}) => {
    return (
      <FlatList
        data={logs.filter(t => !tag || t.tag == tag)}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ minHeight: 30 }}
            className="flex flex-wrap p-2 items-cente border-bottom gap-3 flex-ro"
          >
            <View className="text-bolder flex-row gap-1 flex-wrap">
              <Text
                style={{ fontWeight: 600 }}
                className={`${
                  item?.type?.toLowerCase() == "error" ? "text-red-4O0" : ""
                } text-bold`}
              >
                [{item.type}]
              </Text>
              <Text style={{ fontWeight: 600 }} className="">
                {moment(item.logAt).format('DD-MM-YYYY HH:mm:ss')}
              </Text>
            </View>
            <View>
              <Text className="">{item.message}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item , idx) => item.id+"-"+idx}
        contentContainerStyle={{ paddingBottom: 60 }}
      />
    );
  };
  return {
    log,
    LoggerComponent,
    logToFile,
  };
}

export default useLogger;
