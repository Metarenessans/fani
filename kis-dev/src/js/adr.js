import path from "path"
import XLSX from "xlsx"
import { flattenDeep } from "lodash"
var workbook = XLSX.readFile(path.resolve(__dirname, "../../common/adr.xlsx"));
var sheet_name_list = workbook.SheetNames;

const readyTools = flattenDeep(
  sheet_name_list.map((name, index) => {
    return XLSX.utils.sheet_to_json(workbook.Sheets[name]).map(json => {
      const keys = Object.keys(json)
      return {
        code: json[keys[0]],
        adr2: Number(json[keys[3]]),
      };
    })
  })
);
export default readyTools;