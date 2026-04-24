const express = require("express");

const { listPackages } = require("../controllers/package.controller");

const router = express.Router();

router.get("/", listPackages);

module.exports = router;
