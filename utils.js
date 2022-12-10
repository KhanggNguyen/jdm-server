const request = require("request");
const iconv = require("iconv-lite");
const { json } = require("body-parser");

module.exports.getRelationsAsync = (
  array_relation,
  array_entite,
  array_relation_type,
  eid
) => {
  return new Promise((resolve) => {
    let data = {};
    let entite_type = "entite_type";
    let rel_type = "rel_type";
    let rel = "rel";
    data[rel_type] = [];
    data[rel] = [];
    data[entite_type] = [];

    array_entite.map(function (item) {
      if((item[2].replace(/'/g,"") != "_COM")){
        let entite = {
          eid: item[1],
          name: item[2].replace(/'/g, ""),
          type: item[3],
          w: item[4],
          formated_name: item[5],
        };
        data[entite_type].push(entite);
      }
      
    });

    array_relation_type.map(function (item) {
      let relation_type = {
        rt: item[0],
        rtid: item[1],
        trname: item[2].replace(/'/g, ""),
        trgpname: item[3].replace(/'/g, ""),
        rthelp: item[4],
      };
      data[rel_type].push(relation_type);
    });

    array_relation.map(function (item) {
      //for (j = 0; j < array_entite.length; j++) {
      //  let name = array_entite[j][2].replace(/'/g, "");
      //  if (
      //    /*item[2] == array_entite[j][1] ||*/ item[3] == array_entite[j][1] &&
      //    name != mot && !containsRelationAlready(item[2], item[3], item[4], data[rel]) && 
      //    Number(item[5]) > 0
      //  ) {
        if(item[2] == eid){
          let relation = {
            r_id: item[1],
            r_node1: item[2],
            r_node2: item[3],
            //id_src: array_entite[j][1],
            //entite: name,
            r_type: item[4],
            poids: Number(item[5]),
          };
          data[rel].push(relation);
        }
          
      //  }
      //}
    });

    resolve(data);
  });
};

module.exports.requestToGetBodyAsync = async (url) => {
  return new Promise((resolve) => {
    request(url, { encoding: null, json: true }, (error, response, body) => {
      if (error) {
        return console.log(error);
      }
      console.log("A request to " + url + " has been sent!");
      body = iconv.decode(Buffer.from(body), "iso-8859-1");
      body = body.toString("utf8");
      resolve(body);
    });
  });
};

module.exports.getWordsFromMongoDB = (searchValue, client) => {
  let motif = "^" + searchValue + ".*";

  return new Promise((resolve) => {
    let dbObject = client.db("Jdm");
    let wordsCollection = dbObject.collection("words");

    wordsCollection
      .find({ name: { $regex: motif } }, { sort: "name" })
      .limit(10)
      .toArray(function (err, result) {
        if (err) throw err;
        resolve(result);
      });
  });
};

containsRelationAlready = (node1, node2, r_type, array_relation) => {
  let exists = false;
  array_relation.map(r => {
    if(r["r_type"] == r_type && (node2 == r["r_node2"])){
      exists = true;
    }
  });
  return exists;
}