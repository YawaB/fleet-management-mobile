import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import * as Yup from "yup";
import IDatePicker from "../../../component/Shared/IDatePicker/IDatePicker";
import { resetFormData, saveForm, setFormData } from "../slice/form.slice";
import { getFormFields, startTaskOrStop } from "../../Tasks/slice/slice";
import * as ImagePicker from "expo-image-picker";
import { Dropdown } from "react-native-element-dropdown";
import SignatureCanvasScreen from "./SignatureCanvas";
import moment from "moment";
import { uploadFile } from "../../../core/utils/file";

const buildInitialValues = (fields) => {
  const values = {};
  (fields || []).forEach((field) => {
    switch (field.type) {
      case "text":
        values[field.code] = "";
        break;
      case "select":
        values[field.code] = "";
        break;
      case "date":
        values[field.code] = null;
        break;
      case "checkbox":
        const cbObj = {};
        (field.options || []).forEach((opt, idx) => {
          cbObj[`opt_${idx}`] = false;
        });
        values[field.code] = cbObj;
        break;
      case "radio":
        values[field.code] = null;
        break;
      case "image":
        values[field.code] = null;
        break;
      case "signature":
        values[field.code] = null;
        break;
      default:
        values[field.code] = "";
        break;
    }
  });
  return values;
};

const buildValidationSchema = (fields) => {
  const shape = {};
  (fields || []).forEach((field) => {
    const isRequired = field.isRequired === 1 || field.isRequired === true;
    const requiredMsg = `${field.label} est requis`;

    switch (field.type) {
      case "text":
        shape[field.code] = isRequired
          ? Yup.string().required(requiredMsg)
          : Yup.string();
        break;
      case "select":
        shape[field.code] = isRequired
          ? Yup.string().required(requiredMsg)
          : Yup.string();
        break;
      case "date":
        shape[field.code] = isRequired
          ? Yup.date().nullable().required(requiredMsg)
          : Yup.date().nullable();
        break;
      case "checkbox":
        shape[field.code] = isRequired
          ? Yup.object().test(
              "at-least-one",
              requiredMsg,
              (val) => val && Object.values(val).some((v) => v === true),
            )
          : Yup.object();
        break;
      case "radio":
        shape[field.code] = isRequired
          ? Yup.string().nullable().required(requiredMsg)
          : Yup.string().nullable();
        break;
      case "image":
        shape[field.code] = isRequired
          ? Yup.mixed().nullable().required(requiredMsg)
          : Yup.mixed().nullable();
        break;
      case "signature":
        shape[field.code] = isRequired
          ? Yup.mixed().nullable().required(requiredMsg)
          : Yup.mixed().nullable();
        break;
      default:
        shape[field.code] = isRequired
          ? Yup.string().required(requiredMsg)
          : Yup.string();
        break;
    }
  });
  return Yup.object().shape(shape);
};

const FormScreen = ({ route }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const formFields = useSelector(getFormFields);
  const [selectedImage, setSelectedImage] = useState(null);
  const task = route?.params?.task;

  const initialValues = useMemo(
    () => buildInitialValues(formFields),
    [formFields],
  );
  const validationSchema = useMemo(
    () => buildValidationSchema(formFields),
    [formFields],
  );

  const pickImage = async (setFieldValue, fieldCode) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setSelectedImage(result.assets[0]);
    }
    const uploadResult = await uploadFile(result.assets[0], {
      srcID: 0,
      desc: "image",
      src: "forms",
      extension: "png",
      model: "image",
    });
    if (uploadResult.success) {
      const fileId = uploadResult.save.data.result[0]?.id;
      setFieldValue(fieldCode, fileId);
    } else {
      console.error("❌ Failed to upload image");
    }
  };

  const stopTask = () => {
    let args = {
      srcObject: "Tasks",
      srcId: task.TaskId,
      status: "end",
    };
    console.log("handleStart args:", args, task);
    dispatch(startTaskOrStop(args));
  };

  const onSubmit = async (values, { resetForm }) => {
    try {
      const payload = {
        srcObject: "tasks",
        srcId: task?.TaskId,
        values: (formFields || []).map((field) => {
          let value = values[field.code];
          if (field.type === "image") {
            value = value || null;
          } else if (field.type === "checkbox") {
            const selected = [];
            (field.options || []).forEach((opt, idx) => {
              if (value?.[`opt_${idx}`]) selected.push(opt.label);
            });
            value = selected.join(", ");
          }
          if (field.type === "date") {
            value = moment(value).format("YYYY-MM-DD");
          }
          if (field.type === "signature") {
            value = value || null;
          }
          if (field.type === "image" || field.type === "signature")
            return {
              fieldId: Number(field.id),
              value: value ?? "",
              imageId: value || null,
            };
          return { fieldId: Number(field.id), value: value ?? "" };
        }),
      };

      dispatch(setFormData(payload));
      dispatch(saveForm(payload)).then(({ payload }) => {
        if (payload) {
          resetForm();
          stopTask();
          setSelectedImage(null);
          dispatch(resetFormData());
          navigation.goBack();
        }
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    }
  };

  const renderField = (
    field,
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
  ) => {
    const code = field.code;
    const hasError = touched[code] && errors[code];

    switch (field.type) {
      case "text":
        return (
          <View key={field.id} style={styles.card}>
            <Text style={styles.label}>
              {field.label}
              {field.isRequired === 1 && (
                <Text style={styles.required}> *</Text>
              )}
            </Text>
            <TextInput
              style={styles.textInput}
              value={values[code] || ""}
              onChangeText={(text) => {
                setFieldValue(code, text);
                setFieldTouched(code, true, false);
              }}
              placeholder={`Saisir ${field.label.toLowerCase()}...`}
              placeholderTextColor="#9CA3AF"
            />
            {hasError && <Text style={styles.errorText}>{errors[code]}</Text>}
          </View>
        );

      case "select":
        return (
          <View key={field.id} style={styles.card}>
            <Text style={styles.label}>
              {field.label}
              {field.isRequired === 1 && (
                <Text style={styles.required}> *</Text>
              )}
            </Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              inputSearchStyle={styles.dropdownInputSearch}
              iconStyle={styles.dropdownIcon}
              data={(field.options || []).map((opt) => ({
                label: opt.label,
                value: opt.label,
              }))}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Selectionner..."
              searchPlaceholder="Rechercher..."
              value={values[code] || ""}
              onChange={(item) => {
                setFieldValue(code, item.value);
                setFieldTouched(code, true, false);
              }}
            />
            {hasError && <Text style={styles.errorText}>{errors[code]}</Text>}
          </View>
        );

      case "date":
        return (
          <View key={field.id} style={styles.card}>
            <Text style={styles.label}>
              {field.label}
              {field.isRequired === 1 && (
                <Text style={styles.required}> *</Text>
              )}
            </Text>
            <IDatePicker
              value={values[code]}
              onChange={(val) => {
                setFieldValue(code, val);
                setFieldTouched(code, true, false);
              }}
              style={styles.dateInput}
            />
            {hasError && <Text style={styles.errorText}>{errors[code]}</Text>}
          </View>
        );

      case "checkbox":
        return (
          <View key={field.id} style={styles.card}>
            <Text style={styles.sectionTitle}>
              {field.label.toUpperCase()}
              {field.isRequired === 1 && (
                <Text style={styles.required}> *</Text>
              )}
            </Text>
            {(field.options || []).map((opt, idx) => {
              const optKey = `opt_${idx}`;
              const checked = values[code]?.[optKey] || false;
              return (
                <TouchableOpacity
                  key={optKey}
                  style={styles.checkboxRow}
                  onPress={() => {
                    const updated = { ...values[code], [optKey]: !checked };
                    setFieldValue(code, updated);
                    setFieldTouched(code, true, false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.checkboxLabel}>{opt.label}</Text>
                  <View
                    style={[styles.checkbox, checked && styles.checkboxChecked]}
                  >
                    {checked && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
            {hasError && <Text style={styles.errorText}>{errors[code]}</Text>}
          </View>
        );

      case "radio":
        return (
          <View key={field.id} style={styles.card}>
            <Text style={styles.sectionTitle}>
              {field.label.toUpperCase()}
              {field.isRequired === 1 && (
                <Text style={styles.required}> *</Text>
              )}
            </Text>
            {(field.options || []).map((opt, idx) => {
              const isSelected = values[code] === opt.label;
              return (
                <TouchableOpacity
                  key={`radio_${idx}`}
                  style={styles.radioRow}
                  onPress={() => {
                    setFieldValue(code, opt.label);
                    setFieldTouched(code, true, false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.radioLabel}>{opt.label}</Text>
                  <View
                    style={[styles.radio, isSelected && styles.radioSelected]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
            {hasError && <Text style={styles.errorText}>{errors[code]}</Text>}
          </View>
        );

      case "image":
        return (
          <View key={field.id} style={styles.card}>
            <Text style={styles.sectionTitle}>
              {field.label.toUpperCase()}
              {field.isRequired === 1 && (
                <Text style={styles.required}> *</Text>
              )}
            </Text>
            <TouchableOpacity
              style={styles.imageUploadArea}
              onPress={() => pickImage(setFieldValue, code)}
              activeOpacity={0.7}
            >
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.uploadedImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imageUploadPlaceholder}>
                  <View style={styles.cameraIconCircle}>
                    <Ionicons name="camera" size={28} color="#3B82F6" />
                  </View>
                  <Text style={styles.imageUploadText}>
                    Tap to upload photo
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {hasError && <Text style={styles.errorText}>{errors[code]}</Text>}
          </View>
        );

      case "signature":
        return (
          <View key={field.id} style={styles.card}>
            <Text style={styles.sectionTitle}>
              {field.label.toUpperCase()}
              {field.isRequired === 1 && (
                <Text style={styles.required}> *</Text>
              )}
            </Text>
            <SignatureCanvasScreen
              onSignature={(sig) => {
                console.log("Signature received:", sig);
                setFieldValue(code, sig);
                setFieldTouched(code, true, false);
              }}
              signature={values[code]}
            />
            {hasError && <Text style={styles.errorText}>{errors[code]}</Text>}
          </View>
        );

      default:
        return (
          <View key={field.id} style={styles.card}>
            <Text style={styles.label}>
              {field.label}
              {field.isRequired === 1 && (
                <Text style={styles.required}> *</Text>
              )}
            </Text>
            <TextInput
              style={styles.textInput}
              value={values[code] || ""}
              onChangeText={(text) => {
                setFieldValue(code, text);
                setFieldTouched(code, true, false);
              }}
              placeholder={`Saisir ${field.label.toLowerCase()}...`}
              placeholderTextColor="#9CA3AF"
            />
            {hasError && <Text style={styles.errorText}>{errors[code]}</Text>}
          </View>
        );
    }
  };

  if (!formFields || formFields.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>Aucun champ disponible</Text>
      </View>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({
        values,
        errors,
        touched,
        setFieldValue,
        setFieldTouched,
        handleSubmit,
      }) => (
        <View style={styles.container}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {formFields.map((field) =>
              renderField(
                field,
                values,
                errors,
                touched,
                setFieldValue,
                setFieldTouched,
              ),
            )}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Confirm Button */}
          <View style={styles.confirmContainer}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  required: {
    color: "#DC2626",
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
    color: "#374151",
    backgroundColor: "#fff",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  dropdown: {
    height: 44,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: "#9CA3AF",
  },
  dropdownSelectedText: {
    fontSize: 15,
    color: "#374151",
  },
  dropdownInputSearch: {
    height: 40,
    fontSize: 14,
    borderColor: "#E5E7EB",
  },
  dropdownIcon: {
    width: 20,
    height: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
  },
  checkboxLabel: {
    fontSize: 15,
    color: "#374151",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
  },
  radioLabel: {
    fontSize: 15,
    color: "#374151",
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#3B82F6",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#3B82F6",
  },
  imageUploadArea: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    minHeight: 140,
    overflow: "hidden",
  },
  imageUploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  cameraIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EBF5FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  imageUploadText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  uploadedImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  confirmContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 30,
    backgroundColor: "#F3F4F6",
  },
  confirmButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 4,
  },
});

export default FormScreen;
