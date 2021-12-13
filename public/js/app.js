const urlBase = "http://localhost:8000/api";
const modalLogin = document.getElementById("modalLogin");
const bsModalLogin = new bootstrap.Modal(modalLogin, (backdrop = "static"));
const modalRegister = document.getElementById("modalRegister");
const bsModalRegister = new bootstrap.Modal(
  modalRegister,
  (backdrop = "static")
);

const homeDiv = document.getElementById("home");
const aboutDiv = document.getElementById("about");
const listNews = document.getElementById("news");

const btnModalLogin = document.getElementById("btnloginModal");
const btnModalRegister = document.getElementById("btnregisterModal");
const btnLogoff = document.getElementById("btnLogoff");
const pRegister = document.getElementById("pRegister");

const buttons = document.querySelectorAll("[data-carousel-button]")

buttons.forEach(button => {
  button.addEventListener("click", () => {
    const offset = button.dataset.carouselButton === "next" ? 1 : -1
    const slides = button
      .closest("[data-carousel]")
      .querySelector("[data-slides]")

    const activeSlide = slides.querySelector("[data-active]")
    let newIndex = [...slides.children].indexOf(activeSlide) + offset
    if (newIndex < 0) newIndex = slides.children.length - 1
    if (newIndex >= slides.children.length) newIndex = 0

    slides.children[newIndex].dataset.active = true
    delete activeSlide.dataset.active
  })
});

pRegister.addEventListener("click", () => {
  bsModalLogin.hide();
  callModalRegister();
});

modalLogin.addEventListener("shown.bs.modal", () => {
  document.getElementById("usernameLogin").focus();
});
btnModalLogin.addEventListener("click", () => {
  bsModalLogin.show();
});
btnModalRegister.addEventListener("click", () => {
  callModalRegister();
});

function callModalRegister() {
  document.getElementById("btnSubmitRegister").style.display = "block";
  bsModalRegister.show();
}

btnLogoff.addEventListener("click", () => {
  localStorage.removeItem("token");
  btnModalLogin.style.display = "block";
  btnModalRegister.style.display = "block";
  btnLogoff.style.display = "none";
  window.location.replace("index.html");
});

function validateSignUp() {
  let email = document.getElementById("usernameRegister").value;
  let password = document.getElementById("passwordRegister").value;
  const statReg = document.getElementById("statusRegister");
  if (password.length < 4) {
    document.getElementById("passErrorSignup").innerHTML =
      "The password must have at least 4 characters";
    return;
  }
  fetch(`${urlBase}/signup`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
    body: `email=${email}&password=${password}`,
  })
    .then(async (response) => {
      if (!response.ok) {
        erro = response.statusText;
        statReg.innerHTML = response.statusText;
        throw new Error(erro);
      }
      result = await response.json();
      console.log(result.message);
      statReg.innerHTML = result.message;
      document.getElementById("btnSubmitRegister").style.display = "none";
    })
    .catch((error) => {
      document.getElementById(
        "statusRegister"
      ).innerHTML = `Request failed: ${error}`;
    });
}

function validateLogin() {
  let email = document.getElementById("usernameLogin").value;
  let password = document.getElementById("passwordLogin").value;
  if (password.length < 4) {
    document.getElementById("passErrorLogin").innerHTML =
      "The password must have at least 4 characters";
    return;
  }
  const statLogin = document.getElementById("statusLogin");

  fetch(`${urlBase}/login`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
    body: `email=${email}&password=${password}`,
  })
    .then(async (response) => {
      if (!response.ok) {
        erro = await response.json();
        throw new Error(erro.msg);
      }
      result = await response.json();
      console.log(result.accessToken);
      const token = result.accessToken;
      localStorage.setItem("token", token);
      document.getElementById("statusLogin").innerHTML = "Success!";
      btnLogoff.style.display = "block";
      btnModalLogin.style.display = "none";
      btnModalRegister.style.display = "none";
      document.getElementById("btnLoginClose").click();
    })
    .catch(async (error) => {
      statLogin.innerHTML = error;
    });
}


async function getNews() {
  listNews.style.display = "block";
  listNews.innerHTML = "";
  let url = urlBase + "/news";
  let text = "";
  var myHeaders = new Headers();

  const token = localStorage.token;
  const myInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    },
  };
  const myRequest = new Request(url, myInit);

  await fetch(myRequest).then(async function (response) {
    if (!response.ok) {
      alert("Please log in to have access to the all the data!");
    } else {
      const news = await response.json();
      for (const article of news) {
        text += `
                <div>
        <h4>${article.title}</h4>
        URL: <a href="${article.url}">${article.url}</a></br>
        Source: ${article.source}</br><hr>
        </div>`;
      }
      listNews.innerHTML = text;
      homeDiv.style.display = "none";
      aboutDiv.style.display = "none";
    }
  });
};

async function getNewsById(id) {
  const tags = ['bbc', 'euronews', 'foxnews', 'livescience', 'cnn', 'abcnews', 'nbc'];
  const tag = document.getElementById("tag").value;

  if (!tags.includes(tag)) {
    alert('Please insert a valid tag, it can be one of the following: bbc, euronews, foxnews, livescience, cnn, abcnews, nbc.');
    return;
  };

  listNews.style.display = "block";
  listNews.innerHTML = "";
  let url = urlBase + "/news";
  let text = "";

  if (id != "") {
    url = url + "/" + id
  } else if (tag != "") {
    url = url + "/" + tag;
  }

  const token = localStorage.token;
  const myInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    },
  };
  const myRequest = new Request(url, myInit);

  await fetch(myRequest).then(async function (response) {
    if (!response.ok) {
      alert("Please log in to have access to the full data!");
    } else {
      const news = await response.json();
      for (const article of news) {
        text += `
                <div>
        <h4>${article.title}</h4>
        URL: <a href="${article.url}">${article.url}</a></br>
        Source: ${article.source}</br><hr>
        </div>`;
      }
      listNews.innerHTML = text;
      homeDiv.style.display = "none";
      aboutDiv.style.display = "none";
    }
  });
}

async function about() {
  aboutDiv.style.display = "block";
  homeDiv.style.display = "none";
  listNews.style.display = "none";
}

async function home() {
  homeDiv.style.display = "block";
  aboutDiv.style.display = "none";
  listNews.style.display = "none";
}
