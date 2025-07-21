import React from "react";
import { View, Text } from "react-native";
import CameraScreen from "../CameraScreen";
import { useState } from "react";
import { Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import {
  getPhoto,
  getSavePhotoResult,
  setOpenPhotoView,
} from "../slice/photo.slice";
import { useEffect } from "react";

const TestBarcodeScan = () => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const onUploadFinished = (res, _res) => {
  };

  return (
    <View style={{ flex: 1 }}>
      <Text>Hello</Text>

      <Button
        onPress={() => {
          dispatch(setOpenPhotoView(false));
          setOpen(true);
        }}
        children={<Text>Scan</Text>}
      />
      <CameraScreen
        style={{}}
        extraInfo={{ src: 1, srcID: 3, desc: "test" }}
        open={open}
        onHide={() => setOpen(false)}
        mode={'scan'}
        onScan={(info)=> console.log('info:', info)}
      />
    </View>
  );
};

export default TestBarcodeScan;
