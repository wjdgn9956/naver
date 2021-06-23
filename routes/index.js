const board = require('../models/board');
const express = require('express');
const router = express.Router();

router.get("/", async (req, res, next) => {
    
    const asiaList = [];
	const tmp = await board.getLatest('동남아시아', null, 10, true);
    for await (t of tmp) {
        asiaList[t.category] = asiaList[t.category] || [];
        asiaList[t.category].push(t);
    }

	const data = {
        tmp,
	};
	
	res.render("main/index", data);
});

module.exports = router;