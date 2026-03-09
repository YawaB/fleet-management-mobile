import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Divider } from "react-native-paper";
import SelectDropdown from "react-native-select-dropdown";
import { STYLE } from "../../../core/style";

function ISelectDropdown({
  data,
  onSelect,
  className,
  name,
  style,
  value,
  placeholder,
  icon,
}) {
  let [iStyle, setIStyle] = useState({});
  const _onSelect = (o) => {
    if (typeof onSelect == "function")
      onSelect("value" in o ? o["value"] : o, name);
  };

  useEffect(() => {
    if (style && style?.length > 1) {
      setIStyle(style[0]);
    }
  }, [style]);
  return (
    <SelectDropdown
      data={[{ label: "Selectionner", value: "" }, ...data]}
      renderButton={(selectedItem, isOpened) =>
        icon ? (
          <View>{icon}</View>
        ) : (
          <View
            className=""
            style={{ height: STYLE.inputs.height, ...(iStyle || {}) }}
          >
            <View
              style={{ height: "100%" }}
              className={`${className} ${STYLE.inputs.class}  justify-center`}
            >
              <Text>
                {" "}
                {selectedItem?.label ||
                  value ||
                  placeholder ||
                  "Selectionner..."}
              </Text>
            </View>
          </View>
        )
      }
      renderItem={(item, idx, isSelected) => (
        <View>
          <View className="p-2">
            <Text>{item.label}</Text>
          </View>
          <Divider />
        </View>
      )}
      onSelect={_onSelect}
      search={true}
      searchInputStyle={{ heigth: 20 }}
      searchPlaceHolderColor="Rechercher"
      showsVerticalScrollIndicator
      renderSearchInputLeftIcon={() => (
        <Ionicons name="search-outline" size={15} />
      )}
    />
  );
}

export default ISelectDropdown;
