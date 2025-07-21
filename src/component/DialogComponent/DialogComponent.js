import React, { useEffect, useState } from "react";
import {  StyleSheet, View } from "react-native";
import Dialog from "react-native-dialog";
import { Button } from "react-native-paper";

export default function DialogComponent({
  visible , 
  title,
  content,
  onCancel , 
  onConfirm ,
  confirmLabel,
  confirmStyle,
  confirmClassName,
  cancelLabel,
  cancelStyle,
  cancelClassName,  
  ...props}) {
  const [_visible, setVisible] = useState(false);

  const handleCancel = () => {
    setVisible(false);
    if(typeof onCancel == 'function') onCancel()
  };

  const handleConfirm = () => {
    if(typeof onConfirm == 'function') onConfirm()
    setVisible(false);
  };

  useEffect(() => {
    setVisible(visible);
  }, [visible])

  return (
    <View >
      <Dialog.Container visible={_visible}>
        <Dialog.Title>
          {title || "Confirmation"}
        </Dialog.Title>
        <Dialog.Description>
          {content || props.children || "Veuillez confirmer"}
        </Dialog.Description>
        <Dialog.Button color={"red"} label={cancelLabel || "Fermer"} onPress={handleCancel} />
        <Dialog.Button color={'blue'} label={confirmLabel || "OK"} onPress={handleConfirm} />
      </Dialog.Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});