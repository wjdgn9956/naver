const express = require("express");
const path = require("path");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const methodOverride = require("method-override");
const dotenv = require("dotenv");
const logger = require("./lib/logger");


dotenv.config();

const app = express();

app.set("port", process.env.PORT || 3000);
app.set("view engine", "html");

nunjucks.configure("views", {
    express:app,
    watch:true,
})

if (process.env_NODE_ENV == 'production') {
    app.use(morgan('combined'));
} else {
app.use(morgan("dev"));
}

app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended : false}));


// 오류 처리 미들웨어 //
app.use((err, req, res, next) => {
    err.status = err.status || 500;
    logger("[" + err.status + "]" + err.messsage, 'error');
    logger(err.stack, 'error');
    if (process.env.NODE_ENV == 'production') err.stack = "";

    res.locals.error = err;

    res.status(err.status).render("error");
});

app.listen(app.get("port"), () => {
    console.log(app.get("port"), "번 포트에서 서버 대기중");
})