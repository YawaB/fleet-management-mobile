import { TouchableOpacity, Text } from "react-native";
import { STYLE } from "../../../core/style";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { useState } from "react";
import DatePicker from "react-native-date-picker";

function IDatePicker({
  value,
  onChange,
  format,
  style,
  className,
  defaultStyle,
  mode,
}) {
  let [open, setOpen] = useState(false);

  let _formatDate = () => {
    let date = null;
    if (value) {
      date = moment(value).format(format || "DD/MM/YYYY");
      return date;
    } else {
      return "--/--/----";
    }
  };

  const getValue = () => {
    if (!value) return moment().toDate();
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? new Date() : value;
    }
    const m = moment(value);
    return m.isValid() ? m.toDate() : new Date();
  };

  console.log("getValue", getValue());

  const getMode = () => {
    if (mode === "month" || mode === "date") return "date";
    if (mode === "time") return "time";
    if (mode === "datetime") return "datetime";
    return "date";
  };

  const onConfirm = (date) => {
    setOpen(false);
    if (typeof onChange === "function") onChange(date);
  };

  const onCancel = () => {
    setOpen(false);
  };

  return (
    <TouchableOpacity
      style={{ height: 45 }}
      onPress={() => setOpen(true)}
      className={`flex-row items-center border-gray-200 border rounded-full justify-between bg-white py-2 px-4`}
    >
      <Text> {_formatDate()} </Text>
      <Ionicons name="calendar" size={14} color="#00b4d8" />
      <DatePicker
        modal
        open={open}
        date={getValue()}
        mode={getMode()}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </TouchableOpacity>
  );
}

export default IDatePicker;
