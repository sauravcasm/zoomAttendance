
const puppeteer = require('puppeteer-extra')
let fs=require("fs");
let path=require("path");
const config = require("config.json");
//npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

let cTab;
let presentRollArray=[];

function attendanceFn(link,dir_name){
  
  (async function fn() {
    try {
        let browserOpenPromise = puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized"]
        });
        let browser = await browserOpenPromise;

        let allTabsArr = await browser.pages();
        cTab = allTabsArr[0];
        cTab.setDefaultTimeout(0);

        await cTab.goto(link);

        await cTab.waitForSelector("input[id=inputname]",{visible:true});
        
        await cTab.type("input[id=inputname]", "99_Attendance", { delay: 200 });

        await cTab.waitForSelector('button#joinBtn:not([disabled])');
        
        
        await cTab.evaluate(clickFn, "button[id=joinBtn]");
       
        await cTab.waitForSelector(".footer-button__participants-icon",{visible:true});
        await cTab.evaluate(clickFn, ".footer-button__participants-icon");

        await cTab.waitForSelector(".participants-item__display-name",{visible:true});
        presentRollArray=await cTab.evaluate(consoleFn, ".participants-item__display-name");
        
        //Creating attendance file for first time
        if(fs.existsSync(path.join(__dirname,"attendance"+".json"))==false)
        {
          fs.openSync(path.join(__dirname,"attendance"+".json"),"w");
          var arr=[];
  
          for(let i=1;i<=100;i++)
          {
            arr.push({
              roll:i,
              attended:0,
              total:0
            });
          }
  
          
      
      let contentInFile=JSON.stringify(arr);
      
      fs.writeFileSync(path.join(__dirname,"attendance"+".json"),contentInFile);
    
        }
        else{//If attendance file already exists
          
          //JSON READER
          //we read files contents first to update them
          //otherwise old content will be lost 
          //and we won't be able to update
          function jsonReader(filePath, cb) {
            fs.readFile(filePath, (err, fileData) => {
              if (err) {
                return cb && cb(err);
              }
              try {
                var newarr=[];
                const oldContent = JSON.parse(fileData);
                
                //date
                var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = today.getFullYear();

                today = dd + '/' + mm + '/' + yyyy;//date format
  
                for(let i=0;i<=99;i++)//roll number 1 se chaalu hein object array idx toh 0 se hoga
                {
                  flag=0;
                  for(j=0;j<=presentRollArray.length-1;j++)
                  {
                    if(oldContent[i].roll==presentRollArray[j].roll)//if student present
                    {

                      var myobj1=oldContent[i];
                      myobj1.attended+=1;//attendance increment
                      myobj1.total+=1;//total classes increment

                      //adding 'present' on the particular date
                      var addProp = (obj, propName, propValue) => {
                        // obj.food = 'cheese';
                        obj[propName] = propValue;
                      };
                      addProp(myobj1, today, 'present');


                      newarr.push(myobj1)
                      flag=1;
                      continue;
                    }
                  }// else absent
                    if(flag==1)
                    continue;
                      //same as before

                      var myobj2=oldContent[i];
                      myobj2.total+=1;//total classes increment only

                      
                    //adding 'absent' on the particular date
                      var addProp = (obj, propName, propValue) => {
                      obj[propName] = propValue;
                      };
                      addProp(myobj2, today, 'absent');
                      newarr.push(myobj2)

                }

                //now we push(write) all updated content to file after applying JSON.stringify
                let contentInFile=JSON.stringify(newarr);
                fs.writeFileSync(path.join(__dirname,"attendance"+".json"),contentInFile);
                
                return cb && cb(null, oldContent);
              } catch (err) {
                return cb && cb(err);
              }
            });
          }
          
          jsonReader(path.join(__dirname,"attendance"+".json"), (err, customer) => {
            if (err) {
              console.log(err);
              return;
            }
            
          });
          
        }
  



        //////////////////////////////////////////////////////////////////////////////////

        
    } catch (err) {
        console.log(err);
    }
})();
  
}



function clickFn(selector) {
 document.querySelector(selector).click();
}


function consoleFn(selector) {//returns array of roll numbers of present students
  let presentRolls=[];
        let studentData=[];
        studentData=document.querySelectorAll(".participants-item__display-name");
        for(let i=0;i<studentData.length;i++)
        {
          let presentRollObject={
            roll: studentData[i].innerText.split("_")[0],
            
          }
          presentRolls.push(presentRollObject);
        }
        return presentRolls;
}

module.exports={
  fn:attendanceFn
}
