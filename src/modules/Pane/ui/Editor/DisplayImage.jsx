import { View, Text, ScrollView, Image } from "react-native";
import { IconButton } from "react-native-paper";
import { useDispatch } from "react-redux";
import { setPhoto } from "../../../../component/Shared/CameraScreen/slice/photo.slice";

const DisplayImage = ({ photo, formData, route, setFormData }) => {
  const dispatch = useDispatch();
  const baseUrl = process.env.EXPO_PUBLIC_REACT_APP_SOCKET_IMAGE || "";

  const isImagePath = (p) =>
    typeof p === "string" && /\.(png|jpe?g|webp|gif|bmp|heic|heif)$/i.test(p);
  const isVideoPath = (p) =>
    typeof p === "string" && /\.(mp4|mov|m4v|avi|mkv|webm)$/i.test(p);

  const parseMaybeJsonArray = (s) => {
    try {
      if (typeof s === "string" && s.trim().startsWith("[")) {
        const arr = JSON.parse(s);
        return Array.isArray(arr) ? arr : [];
      }
    } catch (e) {
      // ignore parsing errors
    }
    return [];
  };

  const normalize = (items) => {
    if (!items) return [];
    const arr = Array.isArray(items) ? items : [items];
    const out = [];
    for (const it of arr) {
      if (!it) continue;
      // 1) Expo ImageManipulator/File picker style
      if (typeof it === "object") {
        if (it.uri && isImagePath(it.uri)) {
          out.push(it.uri);
          continue;
        }
        if (it.path && isImagePath(it.path)) {
          out.push(it.path);
          continue;
        }
        if (it.src) {
          // it.src can be a single path or a stringified JSON array
          const parsed = parseMaybeJsonArray(it.src);
          if (parsed.length) {
            parsed.forEach((p) => {
              if (isImagePath(p)) out.push(baseUrl + p);
            });
            continue;
          }
          if (typeof it.src === "string" && isImagePath(it.src)) {
            out.push(baseUrl + it.src);
            continue;
          }
        }
        continue;
      }

      // 2) Raw string
      if (typeof it === "string") {
        const parsed = parseMaybeJsonArray(it);
        if (parsed.length) {
          parsed.forEach((p) => {
            if (isImagePath(p.src)) out.push(baseUrl + p.src);
          });
        } else if (isImagePath(it)) {
          // If it's a relative path, prefix with baseUrl
          const uri =
            it.startsWith("http") || it.startsWith("file://")
              ? it
              : baseUrl + it;
          out.push(uri);
        }
      }
    }
    // Deduplicate
    return Array.from(new Set(out));
  };

  if (Array.isArray(photo) && photo.length > 0) {
    console.log("photo func", typeof photo);
    const resolvePreview = (item) => {
      // Prefer explicit image URIs
      if (item?.uri && isImagePath(item.uri)) return item.uri;
      // If path is an object from manipulateAsync
      if (
        item?.path &&
        typeof item.path === "object" &&
        item.path?.uri &&
        isImagePath(item.path.uri)
      )
        return item.path.uri;
      if (item?.path && typeof item.path === "string") {
        const p =
          item.path.startsWith("http") || item.path.startsWith("file://")
            ? item.path
            : baseUrl + item.path;
        if (isImagePath(p)) return p;
      }
      if (item?.src && typeof item.src === "string") {
        const parsed = parseMaybeJsonArray(item.src);
        if (
          parsed.length &&
          typeof parsed[0] === "string" &&
          isImagePath(parsed[0])
        )
          return baseUrl + parsed[0];
        if (isImagePath(item.src)) return baseUrl + item.src;
      }
      return null;
    };

    const removeAt = (idx) => {
      const next = photo.filter((_, i) => i !== idx);
      // update imageId array with uploaded ones
      const ids = next
        .filter((x) => x?.uploaded && x?.imageId)
        .map((x) => x.imageId);
      dispatch(setPhoto(next));
      setFormData((prev) => ({
        ...prev,
        photo: next,
        imageId: ids.length ? JSON.stringify(ids) : null,
      }));
    };

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: 8 }}
      >
        {photo.map((item, idx) => {
          const isVideo =
            item?.type === "video" ||
            (typeof item?.mimeType === "string" &&
              item.mimeType.startsWith("video"));
          const uri = resolvePreview(item);
          return (
            <View
              key={idx}
              style={{
                width: 100,
                height: 100,
                marginRight: 8,
                position: "relative",
              }}
            >
              {isVideo ? (
                <Video
                  source={{
                    uri:
                      item?.uri ||
                      item?.path ||
                      (typeof item?.path === "object" ? item?.path?.uri : null),
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 8,
                    backgroundColor: "#000",
                  }}
                  resizeMode="cover"
                  useNativeControls
                  isMuted
                />
              ) : uri ? (
                <Image
                  source={{ uri }}
                  style={{ width: "100%", height: "100%", borderRadius: 8 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 8,
                    backgroundColor: "#e5e7eb",
                  }}
                />
              )}
              {/* Index badge */}
              <View
                style={{
                  position: "absolute",
                  top: -8,
                  left: -8,
                  backgroundColor: "rgba(0,0,0,0.7)",
                  borderRadius: 10,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 10 }}>{idx + 1}</Text>
              </View>
              <IconButton
                icon="close-circle"
                size={18}
                style={{ position: "absolute", top: -8, right: -8 }}
                onPress={() => removeAt(idx)}
              />
            </View>
          );
        })}
      </ScrollView>
    );
  }

  let imageSources = [];
  if (formData?.photo) {
    imageSources = normalize(formData.photo);
  } else if (route?.params?.pane?.images) {
    imageSources = normalize(route.params.pane.images);
  }

  if (!imageSources.length) return null;

  let currentIds = [];
  try {
    if (formData?.imageId) {
      const parsed =
        typeof formData.imageId === "string"
          ? JSON.parse(formData.imageId)
          : formData.imageId;
      if (Array.isArray(parsed)) currentIds = parsed;
    } else if (route?.params?.pane?.imageId) {
      const parsed =
        typeof route.params.pane.imageId === "string"
          ? JSON.parse(route.params.pane.imageId)
          : route.params.pane.imageId;
      if (Array.isArray(parsed)) currentIds = parsed;
    }
  } catch (e) {
    // ignore parse errors
  }

  const removeAtExisting = (idx) => {
    const nextImages = imageSources.filter((_, i) => i !== idx);
    const nextIds = (currentIds || []).filter((_, i) => i !== idx);
    setFormData((prev) => ({
      ...prev,
      photo: nextImages,
      imageId: nextIds.length ? JSON.stringify(nextIds) : null,
    }));
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginVertical: 8 }}
    >
      {imageSources.map((uri, idx) => (
        <View
          key={`img-${idx}`}
          style={{
            width: 100,
            height: 100,
            marginRight: 8,
            position: "relative",
          }}
        >
          <Image
            source={{ uri }}
            style={{ width: "100%", height: "100%", borderRadius: 8 }}
            resizeMode="cover"
          />
          {/* Index badge */}
          <View
            style={{
              position: "absolute",
              top: -8,
              left: -8,
              backgroundColor: "rgba(0,0,0,0.7)",
              borderRadius: 10,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 10 }}>{idx + 1}</Text>
          </View>
          <IconButton
            icon="close-circle"
            size={18}
            style={{ position: "absolute", top: -8, right: -8 }}
            onPress={() => removeAtExisting(idx)}
          />
        </View>
      ))}
    </ScrollView>
  );
};

export default DisplayImage;
