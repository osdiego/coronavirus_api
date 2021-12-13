require("dotenv").config();
const db = require("../models/nedb");
const axios = require("axios");
const cheerio = require("cheerio");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const newspapers = [
  {
    name: 'bbc',
    address: 'https://www.bbc.com/news/health',
    base: 'https://www.bbc.com'
  },
  {
    name: 'euronews',
    address: 'https://www.euronews.com/programs/world',
    base: 'https://www.euronews.com'
  },
  {
    name: 'foxnews',
    address: 'https://www.foxnews.com/health',
    base: 'https://www.foxnews.com'
  },
  {
    name: 'livescience',
    address: 'https://www.livescience.com/health',
    base: ''
  },
  {
    name: 'cnn',
    address: 'https://edition.cnn.com/health',
    base: 'https://edition.cnn.com'
  },
  {
    name: 'abcnews',
    address: 'https://abcnews.go.com/Health',
    base: ''
  },
  {
    name: 'nbc',
    address: 'https://www.nbcnews.com/health',
    base: ''
  },
];

const articles = [];
const keywords = ['covid', 'coronavirus', 'omicron'];

function authenticateToken(req, res) {
  console.log("Authorizing...");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    console.log("Null token");
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.email = user;
  });
}

const nodemailer = require("nodemailer");
const { response } = require("express");

async function sendEmail(recipients, confirmationToken) {

  let testAccount = await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  let info = await transporter.sendMail({
    from: '"Covid news" <news@coronavirus.com>',
    to: recipients,
    subject: "Covid news API register confirmation ✔",
    text: "Pending account activation",
    html: "<p><b>Pending account activation</b></p>" + "<p><a href=" + "http://localhost:8000/api/auth/confirm/" + confirmationToken + ">Click here to activate your account!</a></p>"
  });

  console.log("Message sent: %s", info.messageId);

  console.log(
    "Preview URL: %s",
    nodemailer.getTestMessageUrl(info)
  );
}

exports.verifyUser = async (req, res) => {
  const confirmationCode = req.params.confirmationCode;
  db.crUd_ativate(confirmationCode);
  const reply = { message: "Your account has been activated!" };
  console.log(reply);
  return res.send(reply);
};

exports.register = async (req, res) => {
  console.log("Register a new user");
  if (!req.body) {
    return res.status(400).send({
      message: "Content must not be empty!",
    });
  }
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  const email = req.body.email;
  const password = hashPassword;
  const confirmationToken = jwt.sign(
    req.body.email,
    process.env.ACCESS_TOKEN_SECRET
  );
  db.Crud_register(email, password, confirmationToken)
    .then((data) => {
      sendEmail(email, confirmationToken).catch(console.error);
      res.status(201).send({
        message:
          "User created successfully, please confirm your email to activate your account!",
      });
      console.log("Controller - user registered: ");
      console.log(JSON.stringify(data));
    })
    .catch((response) => {
      console.log("controller - register:");
      console.log(response);
      return res.status(400).send(response);
    });
};


exports.login = async (req, res) => {
  console.log("User authentication");
  if (!req.body) {
    return res.status(400).send({
      message: "Content must not be empty!",
    });
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  const email = req.body.email;
  const password = hashPassword;
  db.cRud_login(email) //
    .then(async (data) => {
      if (await bcrypt.compare(req.body.password, data.password)) {
        const user = { name: email };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
        res.json({ accessToken: accessToken });
        console.log("Database query response: ");
        console.log(JSON.stringify(data));
      } else {
        console.log("Incorrect Password");
        return res.status(401).send({ erro: "That password was incorrect. Please try again!" });
      }
    })
    .catch((response) => {
      console.log("controller:");
      console.log(response);
      return res.status(400).send(response);
    });
};

exports.findAll = (req, res) => {
  authenticateToken(req, res);
  newspapers.forEach(newspaper => {
    axios.get(newspaper.address)
      .then(response => {
        const html = response.data
        const $ = cheerio.load(html)

        for (let index in keywords) {
          const word = keywords[index];
          $(`a:contains("${word}")`, html).each(function () {

            const title = $(this).text()
            const url = $(this).attr('href')

            const thisArticle = {
              title,
              url: newspaper.base + url,
              source: newspaper.name
            };

            let isMapped = false;

            for (let article of articles) {
              if (article.url == thisArticle.url) {
                isMapped = true;
                break;
              }
            };

            if (!isMapped) {
              articles.push(thisArticle)
            };
          });
        };

      })
  })
  return res.send(articles);
};

exports.findOne = (req, res) => {
  authenticateToken(req, res);
  const newspaperId = req.params.id
  const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
  const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base

  axios.get(newspaperAddress)
    .then(response => {
      const html = response.data
      const $ = cheerio.load(html)
      const specificArticles = []

      for (let index in keywords) {
        const word = keywords[index];

        $(`a:contains("${word}")`, html).each(function () {
          const title = $(this).text()
          const url = $(this).attr('href')

          const thisArticle = {
            title,
            url: newspaperBase + url,
            source: newspaperId
          };

          let isMapped = false;

          for (let article of specificArticles) {
            if (article.url == thisArticle.url) {
              isMapped = true;
              break;
            }
          };

          if (!isMapped) {
            specificArticles.push(thisArticle)
          };

        });
      };

      res.json(specificArticles)
    }).catch(err => console.log(err))
};
