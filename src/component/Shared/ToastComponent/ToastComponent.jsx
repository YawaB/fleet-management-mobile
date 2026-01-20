import { View } from "react-native";
import React from "react";

import { Snackbar } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { hideToast, selectToast } from "./slice/toastSlice";
import { colors } from "../../../theme/colors";

const ToastComponent = () => {
  const dispatch = useDispatch();
  const toast = useSelector(selectToast);

  const getBackgroundColor = () => {
    switch (toast.type) {
      case "success":
        return colors.success;
      case "error":
        return colors.error;
      case "warning":
        return colors.warning;
      default:
        return colors.secondary;
    }
  };

  return (
    <View pointerEvents="box-none" style={{ flex: 1 }}>
      <Snackbar
        visible={!!toast.visible}
        onDismiss={() => dispatch(hideToast())}
        duration={5000}
        style={{ backgroundColor: getBackgroundColor() }}
      >
        {toast.message}
      </Snackbar>
    </View>
  );
};

export default ToastComponent;
