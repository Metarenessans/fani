import XLSX from "xlsx"
import { flattenDeep } from "lodash"
import path from "path"

var workbook = XLSX.readFile(path.resolve(__dirname, "adr-new.xlsx"));
var sheet_name_list = workbook.SheetNames.filter(name => ["ФОРТС", "Акции РФ", "Акции US"].indexOf(name) > -1);

// sheet_name_list = [ sheet_name_list[1] ];

console.log(sheet_name_list);

if (true) {
  let parsed = [];

  for (let name of sheet_name_list) {
    for (let json of XLSX.utils.sheet_to_json(workbook.Sheets[name])) {

      const code      = json["CODE"];
      const timeFrame = json["TimeFrame"]; // D, W, MN
      const adr       = json["ADR%"];
      const isFutures = name == "ФОРТС";

      let adrProp = "adr";
      if (timeFrame == "W") {
        adrProp = "adrWeek";
      }
      else if (timeFrame == "MN") {
        adrProp = "adrMonth";
      }

      let found = parsed.find(token => token.code == code);
      let index
      if (found) {
        index = parsed.indexOf(found);
      }
      else {
        found = {};
        index = parsed.length;
      }

      parsed[index] = {
        ...found,
        code,
        [adrProp]: adr,
        isFutures,
      };
    }
  }

  if (false) {
    console.log(
      parsed.filter(item => {
        let valid = true;
        let count = 0;
        for (let prop of ["adr", "adrWeek", "adrMonth"]) {
          valid = valid && item[prop] != null;
          if ( valid ) {
            count++;
          }
        }
  
        console.log(count);
        if (count <= 1) {
          return item;
        }
      })
    );
  }
  // fs.writeFileSync(path.resolve(__dirname, "../common/adr.json"), JSON.stringify(parsed, null, 2));
  fs.writeFileSync(path.resolve(__dirname, "adr-new.json"), JSON.stringify(parsed, null, 2));
  // console.log(parsed);
}