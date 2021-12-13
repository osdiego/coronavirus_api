module.exports = app => {
    const controller = require("../controllers/controller.js");
    var router = require("express").Router();

    router.post("/signup", controller.register);

    router.post("/login", controller.login);

    router.get("/auth/confirm/:confirmationCode", controller.verifyUser);

    router.get("/news", controller.findAll)

    router.get("/news/:id", controller.findOne);

    app.use('/api', router)
}
