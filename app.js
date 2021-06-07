const express = require("express");
const path = require("path");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const methodOverride = require("method-override");
const dotenv = require("dotenv");


dotenv.config();

const app = express();

app.set("port", process.env.PORT || 3000);


app.listen(app.get("port"), () => {
    console.log(app.get("port"), "번 포트에서 서버 대기중");
})