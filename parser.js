const fs = require("fs");
const es = require("event-stream");

module.exports.parserSpace = (str) => {
  return str.replace(/ /g, "+");
};

module.exports.parserURL = (mot, rel) => {
  let url =
    "http://www.jeuxdemots.org/rezo-dump.php?gotermsubmit=Chercher&gotermrel=";

  if (mot) {
    url += this.parserSpace(mot);
  }

  if (rel) {
    url += "&rel=" + this.parserSpace(rel);
  }

  url += "&charset=utf-8";

  return url;
};

module.exports.parserWordsList = (mot) => {
  let words = {};
  let key = "mot";
  words[key] = [];
  let counter = 0;
  let motif = mot.replace("#", "");
  return new Promise((resolve) => {
    let s = fs
      .createReadStream("entries.txt", { encoding: "latin1" })
      .pipe(es.split())
      .pipe(
        es
          .mapSync(function (line) {
            let word = line.split(";")[1];
            if (word && word.includes(motif)) {
              //console.log(line.split(";")[0] + " : " + word);
              words[key].push(word);
            }
          })
          .on("end", function () {
            resolve(words);
          })
      );
  });
};

module.exports.parserWordsListMongoDB = (mot, client) => {
  let motif = mot.replace("#", ".*");
  if(mot.indexOf("#") == 0){
    motif = motif + "$";
  }else if(mot.indexOf("#") == mot.length){
    motif = "^" + motif;
  }else{
    motif = "^" + motif + "$";
  }
  return new Promise((resolve) => {
    let dbObject = client.db("Jdm");
    let wordsCollection = dbObject.collection("words");
    
    wordsCollection
      .find({ name: { $regex: `.*${motif}.*` } })
      .toArray(function (err, result) {
        if (err) throw err;
        resolve(result);
      });
  });
};

module.exports.parserWordToList = (array_mot) => {
  return new Promise((resolve) => {
    let entite_type = {
      e: array_mot[0],
      eid: array_mot[1],
      name: array_mot[2],
      type: array_mot[3],
      w: array_mot[4],
      formated_name: array_mot[5]
    };
    resolve(entite_type);
  });
  
  
  
}