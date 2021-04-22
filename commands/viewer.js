let fs=require("fs");
let path=require("path");
const config = require("config.json");


function jsonReader(filePath, cb) {
  fs.readFile(filePath, (err, fileData) => {
    if (err) {
      return cb && cb(err);
    }
    try {
      var newarr=[];
      const object = JSON.parse(fileData);
      console.table(object);
      return cb && cb(null, object);
    } catch (err) {
      return cb && cb(err);
    }
  });
}

function viewer(){
jsonReader(path.join(__dirname,"attendance"+".json"), (err, customer) => {
  if (err) {
    console.log(err);
    return;
  }
  
});
}


module.exports={
  fn:viewer
}