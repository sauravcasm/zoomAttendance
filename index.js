let fs=require("fs");
let helperFile = require("./commands/help.js");
let attendanceFile = require("./commands/attendance.js");
let viewerFile=require("./commands/viewer.js");
let input = process.argv.slice(2);//node file.js input[0] input[1] input[2] ..

let command = input[0];

switch (command) {
  case "attendance":
      attendanceFile.fn(input[1])//link=input1 , dir_name=input2
      break;
  case "help":
      helperFile.fn()
      break;
  case "viewer":
  viewerFile.fn()
  break;
  default:
      console.log("wrong command type help for all the commands");
    break;
}



