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

const TestCamera = () => {
  const [open, setOpen] = useState(false);
  const [enginImage, setEnginImage] = useState(null);
  const photo = useSelector(getPhoto);
  const result = useSelector(getSavePhotoResult);
  const dispatch = useDispatch();
  const onImage = (image, extra) => {
    setEnginImage(image);
  };

  const onUploadFinished = (res, _res) => {
  };

  return (
    <View style={{ flex: 1 }}>
      <Text>Hello</Text>
      <Button
        onPress={() => dispatch(setOpenPhotoView(true))}
        children={<Text>Take picture</Text>}
      />
      <Button
        onPress={() => {
          dispatch(setOpenPhotoView(false));
          setOpen(true);
        }}
        children={<Text>Take Local</Text>}
      />
      <CameraScreen
        style={{}}
        extraInfo={{ src: 1, srcID: 3, desc: "test" }}
        onUploadFinished={onUploadFinished}
        open={open}
        onHide={() => setOpen(false)}
      />
    </View>
  );
};

export default TestCamera;
