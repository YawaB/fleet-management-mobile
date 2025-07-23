import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Menu, Button, Divider, PaperProvider } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentUser,
  logout,
} from "../modules/Authentication/slice/auth.slice";
import { getUiParams } from "../store/slice/ui";

function MenuComponent({ navigator, title }) {
  const current_user = useSelector(getCurrentUser);
  let uiParams = useSelector(getUiParams);
  const [visible, setVisible] = useState(false);
  let navigation = useNavigation();
  let dispatch = useDispatch();
  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);
  const _logOut = () => {
    dispatch(logout()).then(({ payload }) => {
      navigation.navigate("Login");
    });
  };

  console.log(uiParams, "uiParams");

  const navigateTo = (app) => {
    navigation.navigate(app);
    closeMenu();
  };

  const goBack = () => {
    if (navigator) navigator.goBack();
    else navigation.goBack();
  };

  return (
    <View className="flex-row p-2 bg-orange-500 justify-between items-center shadow-3">
      <Ionicons
        name="arrow-undo-outline"
        color={"#fff"}
        size={30}
        onPress={goBack}
      />
      <View>
        <Text
          clasName="text-white font-bold"
          style={{ color: "#fff", fontWeight: "bold" }}
        >
          {uiParams?.title || title}
        </Text>
      </View>
      <View clasName="flex-row  items-center justify-center bg-white">
        <Menu
          clasName="bg-white"
          style={{ backgroundColor: "white" }}
          visible={visible}
          onDismiss={closeMenu}
          anchor={
            current_user ? (
              <TouchableOpacity
                onPress={openMenu}
                className="h-8 w-8 items-center justify-center rounded-full bg-white"
              >
                <Text>{current_user?.pseudo}</Text>
              </TouchableOpacity>
            ) : (
              <Ionicons
                size={20}
                onPress={openMenu}
                name="ellipsis-vertical-outline"
              />
            )
          }
        >
          <Menu.Item onPress={closeMenu} title="Profile" />
          <Divider />
          <Menu.Item onPress={closeMenu} title="Parametre" />
          <Divider />
          <Menu.Item
            onPress={() => navigateTo("Features")}
            title="Applications"
          />
          <Divider />
          <Menu.Item onPress={_logOut} title="Deconnexion" />
          <Divider />
          <Menu.Item onPress={() => navigateTo("Logger")} title="Les logs" />
        </Menu>
      </View>
    </View>
  );
}

export default MenuComponent;
