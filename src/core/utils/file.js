import { Image } from "react-native-compressor";
import * as ImageManipulator from "expo-image-manipulator";
import { File, Paths } from "expo-file-system/next";
import { request } from "../../api";

// Helpers to detect file types by extension
function getExtensionFromUri(uri) {
  try {
    const q = uri.split("?")[0];
    const idx = q.lastIndexOf(".");
    if (idx === -1) return "";
    return q.substring(idx + 1).toLowerCase();
  } catch {
    return "";
  }
}

function isImageExtension(ext) {
  return ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(
    (ext || "").toLowerCase()
  );
}

function isAudioExtension(ext) {
  return ["m4a", "mp3", "wav", "aac", "ogg", "oga", "flac"].includes(
    (ext || "").toLowerCase()
  );
}

export async function _compressBase64(base64, options) {
  console.log("start compressing", base64);
  try {
    return await compress(base64, {
      width: 400,
      type: "image/png",
      max: 200, // max size
      min: 20, // min size
      quality: 0.7,
    });
  } catch (err) {
    console.log("error compressing", err);
    return null;
  }
}

export async function compressBase64(uri, options = {}) {
  try {
    const extFromOpt = (options.extension || "").toLowerCase();
    const extFromUri = getExtensionFromUri(uri);
    const ext = extFromOpt || extFromUri;

    const model = (options.model || "").toLowerCase();

    // If audio (by model or extension), skip image compression and just convert to base64
    if (model === "audio" || isAudioExtension(ext)) {
      return await filePathToBase642(uri);
    }

    // If image, compress then convert to base64
    if (isImageExtension(ext) || model === "image" || !ext) {
      const result = await Image.compress(uri, {
        maxWidth: 500,
        quality: 0.9,
      });
      let finalRes = result;
      if (result) {
        finalRes = await filePathToBase642(result);
      }
      return finalRes;
    }

    // Fallback for unknown types: just convert to base64 without compression
    return await filePathToBase642(uri);
  } catch (err) {
    console.log("error compressing", err);
    return null;
  }
}

export async function convertToBase64() {}

export function localFilesPathToBase64(files) {
  try {
    return files.map((file) => {
      return localFileToBase64(file);
    });
  } catch (err) {
    console.log("error converting files to base64", err);
    return null;
  }
}

function localFileToBase64(path) {
  try {
    if ((path || "").includes("base64")) return path;
    let file = new File(path);
    return file.base64();
  } catch (err) {
    console.log("error converting files to base64", err);
    return null;
  }
}

function filePathToBase642(path) {
  return new Promise((resolve, result) => {
    setTimeout(() => {
      let xhr = new XMLHttpRequest();
      xhr.open("GET", path, true);
      xhr.responseType = "blob";
      xhr.onload = function (oEvent) {
        if (xhr.response instanceof Blob) {
          let blob = xhr.response;
          let reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(blob);
        } else {
          resolve(undefined);
        }
      };
      xhr.send();
    }, 0);
  });
}

export function moveFileToDocument(dir) {
  try {
    console.log("Start moving file");
    const file = new File(dir);
    file.move(Paths.document);
    console.log("End moving file", file.uri);
    return file.uri.toString();
  } catch (err) {
    console.log("error reading file", err);
    return null;
  }
}

export async function uploadFile(file, options = {}) {
  try {
    // Default options
    const defaults = {
      srcID: 0,
      desc: "0",
      x: Math.floor(Math.random() * 10000000 + 1),
      model: "upload",
      path: "import/uploads",
      name: null,
    };

    const finalOptions = { ...defaults, ...options };

    // If file is a URI, convert to base64
    let base64Data = file;

    console.log("uploadFile file", file);
    if (typeof file === "string" && file.startsWith("file://")) {
      base64Data = await compressBase64(file, finalOptions);
    }

    // Upload the file
    const uploadResult = await request("file/upload", {
      method: "post",
      data: {
        base64: base64Data,
        model: finalOptions.model,
        path: finalOptions.path,
        name:
          finalOptions.name ||
          `${finalOptions.srcID}${finalOptions.desc}${finalOptions.src}_${
            finalOptions.x
          }.${finalOptions.extension || "png"}`,
      },
    });
    console.log("uploadResult _args", {
      base64: base64Data,
      model: finalOptions.model,
      path: finalOptions.path,
      name:
        finalOptions.name ||
        `${finalOptions.srcID}${finalOptions.desc}${finalOptions.src}_${
          finalOptions.x
        }.${finalOptions.extension || "png"}`,
    });
    console.log("uploadResult funct", uploadResult);
    // If upload successful, save file metadata
    if (uploadResult?.data?.success) {
      const saveResult = await request("file/save", {
        method: "post",
        data: {
          src: finalOptions.src,
          srcID: finalOptions.srcID,
          desc: finalOptions.desc,
          path: uploadResult.data.result,
          id: finalOptions.id || 0,
        },
      });

      return {
        upload: uploadResult,
        save: saveResult,
        success: saveResult?.data?.success,
      };
    }

    return {
      upload: uploadResult,
      success: false,
    };
  } catch (error) {
    console.error("Error in uploadFile:", error);
    return {
      error,
      success: false,
    };
  }
}

export function readFile() {
  try {
    const file = new File(Paths.document, "exampl.txt");
    console.log("content", file.text());
  } catch (err) {
    console.log("error reading file", err);
  }
}

export function createFile() {
  try {
    console.log("start creating file");
    const file = new File(Paths.document, "example.txt");
    file.create(); // can throw an error if the file already exists or no permission to create it
    file.write("Hello, world!");
    console.log(file.text(), file.parentDirectory); // Hello, world!
    console.log("end creating file");
  } catch (error) {
    console.error(error);
  }
}
