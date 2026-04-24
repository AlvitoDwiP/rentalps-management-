const express = require("express");

const { listConsoles } = require("../controllers/console.controller");

const router = express.Router();

router.get("/", listConsoles);

module.exports = router;
