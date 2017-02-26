const fs = require("fs");
const browserify = require("browserify");
const manifest = require("../assets/manifest.json");
const copyfiles = require('copyfiles');

const logglyKey = process.env.LOGGLY_KEY || "";
const logglyTag = process.env.LOGGLY_TAG || "readmore-extension";
const baseUri = process.env.BASE_URI || "https://read-more-api.herokuapp.com";

manifest.permissions.push(baseUri + "/");
fs.writeFileSync("./dist/manifest.json", JSON.stringify(manifest));

fs.mkdirSync("./dist/scripts");
buildModule('background');
buildModule('popup');


copyfiles(["assets/html/**", "dist/html"], true, function(err, files) {
    if (err) throw err;
});

copyfiles(["assets/img/**", "dist/img"], true, function(err, files) {
    if (err) throw err;
});

copyfiles(["assets/style/**", "dist/style"], true, function(err, files) {
    if (err) throw err;
});

function buildModule(moduleName) {
  browserify(`./tmp/js/${moduleName}.js`)
    .transform("browserify-replace", {replace: [
      { from: /\$logglyKey/, to: logglyKey },
      { from: /\$logglyTag/, to: logglyTag },
      { from: /\$baseUri/, to: baseUri }
    ]})
    .bundle()
    .pipe(fs.createWriteStream(`./dist/scripts/${moduleName}.js`));
}