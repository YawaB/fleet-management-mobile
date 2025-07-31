import { request } from "../../../../api";

export async function _saveFile(options) {
  return await request("file/save", {
    data: options,
  });
}
