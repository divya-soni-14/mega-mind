const question = document.querySelector("#q-text");
const choices = Array.from(document.querySelectorAll(".choice-text"));
const answerbtns = Array.from(document.querySelectorAll(".option-btn"));

var startButton = document.getElementById("start-timer");

let opBtn1, opBtn2, opBtn3, opBtn4;
opBtn1 = document.getElementById("opt-1");
opBtn2 = document.getElementById("opt-2");
opBtn3 = document.getElementById("opt-3");
opBtn4 = document.getElementById("opt-4");

let optText1 = document.querySelector("#optText-1");
let optText2 = document.querySelector("#optText-2");
let optText3 = document.querySelector("#optText-3");
let optText4 = document.querySelector("#optText-4");

var lockButton = document.getElementById("lock-question-btn");
var cancelLockButton = document.getElementById("cancel-lock-btn");

let answerSelected = false;

//true when question is displayed
let questionIsActive = true;

//false when option is locked
let timerIsActive = false;

//time up check
let timeUp = false;

//option locked
let locked = null;
let lockedIndex = -1;

//get this from api. this is not the INDEX
let rightOption = 1;
let rightOptionBtn;

//50-50 questions
var remove1 = null;
var remove2 = null;

// index 0: expert advice, 1: flip the question, 2: 50:50
let lifelineUsed = [0, 0, 0];

let l1;
let l2;
let l3;

let score = 0;

//storing and loading values

//timer
function getTimeRemaining(timeInSeconds) {
  var finalTime = new Date().getTime() + timeInSeconds;
  const total = Date.parse(new Date(finalTime)) - Date.parse(new Date());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return {
    total,
    days,
    hours,
    minutes,
    seconds,
  };
}
let pause = false;
function initializeClock(id, endtime) {
  const clock = document.getElementById(id);

  //can interact with the question
  questionIsActive = true;
  answerbtns.forEach((choice) => {
    choice.addEventListener("click", function () {
      console.log(choice);
      if (locked == null) {
        //highlight selected option
        choice.classList.add("answer-selected");
        choice.classList.remove("answer-normal");

        //find ID of selected option
        let tempSelected = choice.firstElementChild.innerText.slice(0, 1);

        switch (tempSelected) {
          case "A":
            locked = opBtn1 === remove1 || opBtn1 === remove2 ? null : opBtn1;
            lockedIndex = 0;
            break;
          case "B":
            locked = opBtn2 === remove1 || opBtn2 === remove2 ? null : opBtn2;
            lockedIndex = 1;
            break;
          case "C":
            locked = opBtn3 === remove1 || opBtn3 === remove2 ? null : opBtn3;
            lockedIndex = 2;
            break;
          case "D":
            locked = opBtn4 === remove1 || opBtn4 === remove2 ? null : opBtn4;
            lockedIndex = 3;
            break;
        }

        if (locked === null) return;
        else {
          lockButton.disabled = false;
          lockButton.classList.remove("btn-secondary");
          lockButton.classList.add("btn-success");
          cancelLockButton.disabled = false;
        }
      } else {
        // questionIsActive = false;
      }
    });
  });

  const timeinterval = setInterval(() => {
    if (!pause) {
      endtime = endtime - 1;
    }
    const t = getTimeRemaining(endtime * 1000);
    clock.innerHTML = t.minutes + " min : " + t.seconds + " sec";
    if (endtime <= 0 || timerIsActive === false) {
      clearInterval(timeinterval);
      startButton.innerText = timerIsActive ? "Time Up!" : "Timer Stopped";
      if (endtime <= 0) {
        timeUp = true;
        if (locked) lockButton.click();
      }
    }
  }, 1000);
}

var pauseBtn = document.getElementById("pause-question-btn");

pauseBtn.addEventListener("click", function () {
  pause = !pause;
  if (pause) pauseBtn.innerHTML = "RESUME";
  else pauseBtn.innerHTML = "PAUSE";
  console.log(pause);
});

// //get questions

// http://localhost:8000/api/questions/1/prev_category

// async function getQuestions() {
//   const url = "http://localhost:8000/api/questions/1/any";
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), 5000);
//   const requestOptions = {
//     method: "GET",
//     signal: controller.signal,
//     mode: "cors",
//   };
//   const response = await fetch(url, requestOptions);

//   const data = await resolve(response.json());
//   return data;
// }
let questionNum;
function getQuestions() {
  questionNum = localStorage.getItem("qnumber");
  let category = localStorage.getItem("category");
  lifeLineUsed = JSON.parse(localStorage.getItem("lifelineUsed"));
  if (!category) category = "any";
  const url = `http://localhost:8000/api/questions/${questionNum}/${category}`;
  console.log("qno", questionNum);
  console.log("cat", category);
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5000);
  const requestOptions = {
    method: "GET",
    signal: controller.signal,
    mode: "cors",
  };

  var updateQTree = document.getElementById(`prize-${questionNum}`);
  updateQTree.style.color = "goldenrod";
  console.log(updateQTree);

  if (lifeLineUsed && lifeLineUsed[2] === 1) {
    removeTwoBtn.classList.remove("lifeline-active");
    removeTwoBtn.classList.add("lifeline-used");
  }

  if (lifeLineUsed && lifeLineUsed[0] === 1) {
    expertAdviceBtn.classList.remove("lifeline-active");
    expertAdviceBtn.classList.add("lifeline-used");
  }

  return fetch(url, controller)
    .then((response) =>
      response
        .json()
        .then((data) => {
          return data;
        })
        .catch((e) => console.log(e))
    )
    .catch((e) => console.log(e));
}

let questionDataGlobal;

var startButton = document.getElementById("start-timer");

function addNewQuestion() {
  // if (startButton.disabled === false) {

  let questionData = Promise.resolve(getQuestions()).then((res) => {
    localStorage.setItem("category", res.category);
    questionDataGlobal = res;
    console.log(res);
    question.innerHTML = res.ques;
    optText1.innerHTML = res.options[0].text;
    optText2.innerHTML = res.options[1].text;
    optText3.innerHTML = res.options[2].text;
    optText4.innerHTML = res.options[3].text;
    for (let i = 0; i < 4; i++) {
      if (res.options[i].correct === true) {
        rightOption = i;
        console.log("right option is " + rightOption);
      }
    }

    switch (rightOption) {
      case 0:
        rightOptionBtn = opBtn1;
        console.log(rightOptionBtn);
        break;
      case 1:
        rightOptionBtn = opBtn2;
        console.log(rightOptionBtn);
        break;
      case 2:
        rightOptionBtn = opBtn3;
        console.log(rightOptionBtn);
        break;
      case 3:
        rightOptionBtn = opBtn4;
        console.log(rightOptionBtn);
        break;
    }
    console.log(rightOptionBtn);
  });
  let timer;
  if (!questionNum) timer = 60;
  else if (questionNum < 5) timer = 60;
  else if (questionNum < 8) timer = 90;
  else if (questionNum < 11) timer = 180;
  else timer = 1000000;

  initializeClock("start-timer", timer);
  startButton.disabled = true;
  timerIsActive = true;
  question.classList.remove("blurred-div");

  choices.forEach((choice) => {
    choice.classList.remove("blurred-div");
  });
}

//display question and start timer
startButton.addEventListener("click", addNewQuestion);

//check locked answer

function checkLocked() {
  var lockedBtn = document.getElementById(locked.id);
  //check if answer is true
  lockedBtn.classList.remove("answer-selected");

  questionIsActive = false;
  timerIsActive = false;

  if (lockedIndex === rightOption) {
    lockedBtn.classList.add("answer-correct");
    correctAnswer();
  } else {
    lockedBtn.classList.add("answer-wrong");
    wrongAnswer();
  }
}

//locked answer is checked
lockButton.addEventListener("click", function () {
  checkLocked();
});

//cancel locked option
cancelLockButton.addEventListener("click", function () {
  this.disabled = true;
  locked.classList.add("answer-normal");
  locked.classList.remove("answer-selected");
  locked = null;
  lockButton.disabled = true;
  lockedBtn.classList.remove("btn-success");
  lockButton.classList.add("btn-secondary");
  questionIsActive = true;
});

//function if correct
function correctAnswer() {
  var actionCenter = document.getElementById("actionSelector");
  var successCenter = document.getElementById("correct-answer-action-selector");

  //this does what it says it does
  actionCenter.classList.add("display-none");
  successCenter.classList.remove("display-none");

  //increment score
  score++;

  // nextQuestion();
  console.log(localStorage.getItem("score"));
}

//function if answer is wrong
function wrongAnswer() {
  var actionCenter = document.getElementById("actionSelector");
  var failCenter = document.getElementById("wrong-answer-action-selector");

  var failText = document.getElementById("wrong-answer-alert-text");
  actionCenter.classList.add("display-none");
  failCenter.classList.remove("display-none");

  failText.innerText = !locked
    ? "You're out of time! :("
    : "That was the wrong answer! :(";
  //this does what it says it does

  //ADD SAVING SCORE AND DATA TO SERVER
}

var checkRightBtn = document.getElementById("check-right-answer");

checkRightBtn.addEventListener("click", function () {
  rightOptionBtn.classList.remove("answer-normal");
  rightOptionBtn.classList.add("answer-correct");
});

// LIFELINES

//50-50
var removeTwoBtn = document.getElementById("removeTwoLL");

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

function removeTwo() {
  // 0 1 2 3
  let wrongAns = [0, 1, 2, 3];
  wrongAns.splice(rightOption, 1);

  // let i1 = Math.floor(Math.random() * 4);
  let i1 = wrongAns.random();
  let removeOpt1 = wrongAns[i1];
  wrongAns.splice(wrongAns.indexOf(i1), 1);

  // let i2 = Math.floor(Math.random() * 4);
  let i2 = wrongAns.random();
  let removeOpt2 = wrongAns[i2];
  wrongAns.splice(wrongAns.indexOf(i2), 1);

  console.log(removeOpt1, removeOpt2);
  var remove1 = document.getElementById("opt-" + (i1 + 1));
  var remove2 = document.getElementById("opt-" + (i2 + 1));

  locked = null;
  remove1.classList.remove("answer-correct");
  remove1.classList.add("answer-invalid");

  remove2.classList.remove("answer-correct");
  remove2.classList.add("answer-invalid");

  removeTwoBtn.classList.remove("lifeline-active");
  removeTwoBtn.classList.add("lifeline-used");
  lifelineUsed[2] = 1;
  localStorage.setItem("l3", 1);
}

removeTwoBtn.addEventListener("click", function () {
  lifeLineUsed = JSON.parse(localStorage.getItem("lifelineUsed"));
  if (localStorage.getItem("l3") !== "1")
    if (timerIsActive && lifelineUsed[2] === 0) removeTwo();
});

//EXPERT ADVICE
var expertAdviceBtn = document.getElementById("expert-advice-btn");
function ExpertAdvice() {
  console.log("EA");
  lifeLineUsed = JSON.parse(localStorage.getItem("lifelineUsed"));
  lifelineUsed[0] = 1;
  localStorage.setItem("lifelineUsed", JSON.stringify(lifelineUsed));
  localStorage.setItem("l1", 1);
  expertAdviceBtn.classList.remove("lifeline-active");
  expertAdviceBtn.classList.add("lifeline-used");
}

expertAdviceBtn.addEventListener("click", function () {
  lifeLineUsed = JSON.parse(localStorage.getItem("lifelineUsed"));
  if (lifelineUsed[0] === 0) ExpertAdvice();
});

// NEXT QUESTIONS
function nextQuestion() {
  console.log(score);
  console.log(lifelineUsed);
  location.reload();
  console.log(score);
  console.log(lifelineUsed);
}

//FLIP THE QUESTION
var flipQ = document.getElementById("flipQuestionBtn");
flipQ.addEventListener("click", function () {
  if (localStorage.getItem("l2") === "1") return;
  else {
    console.log("FQ works");
    localStorage.setItem("qnumber", questionNum);
    window.location.reload();
    localStorage.setItem("l2", 1);
    flipQ.classList.add("lifeline-used");
    flipQ.classList.remove("lifeline-active");
  }
});

//next question

var nextBtn = document.getElementById("next-question-btn");

nextBtn.addEventListener("click", function () {
  l1 = localStorage.getItem("l1");
  l2 = localStorage.getItem("l2");
  l3 = localStorage.getItem("l3");
  questionNum = localStorage.getItem("qnumber");
  questionNum++;
  var updateQTree = document.getElementById(`prize-${questionNum}`);
  console.log(questionNum);
  updateQTree.style.color = "goldenrod";
  console.log(updateQTree);
  localStorage.setItem("qnumber", questionNum);
  localStorage.setItem("lifelineUsed", JSON.stringify(lifelineUsed));
  localStorage.setItem("l1", l1);
  localStorage.setItem("l2", l2);
  localStorage.setItem("l3", l3);
  console.log(lifelineUsed);

  window.location.reload();
  var updateQTree = document.getElementById(`prize-${questionNum}`);
  updateQTree.style.color = "goldenrod";
  console.log(updateQTree);
  lifeLineUsed = JSON.parse(localStorage.getItem("lifelineUsed"));

  l1 = localStorage.getItem("l1");
  l2 = localStorage.getItem("l2");
  l3 = localStorage.getItem("l3");

  console.log("LL used" + lifeLineUsed);
  if (l1 === 1) {
    expertAdviceBtn.classList.add("lifeline-used");
    expertAdviceBtn.classList.remove("lifeline-active");
  }

  if (l3 === 1) {
    removeTwo.classList.add("lifeline-used");
    removeTwo.classList.remove("lifeline-active");
  }
});

var newGameBtn = document.getElementById("new-game");
newGameBtn.addEventListener("click", function () {
  localStorage.removeItem("lifelineUsed");
  localStorage.setItem("qnumber", "1");

  localStorage.setItem("lifelineUsed", JSON.stringify(lifelineUsed));
  localStorage.setItem("l1", 0);
  localStorage.setItem("l2", 0);
  localStorage.setItem("l3", 0);
  questionNum = 1;
  window.location.reload();
});

window.onload = function () {
  lifeLineUsed = JSON.parse(localStorage.getItem("lifelineUsed"));
  l1 = localStorage.getItem("l1");
  l2 = localStorage.getItem("l2");
  l3 = localStorage.getItem("l3");
  console.log("lifelines");
  console.log(l1);
  console.log(l2);
  console.log(l3);
  if (l3 === "1") {
    console.log("EA isnt updated");
    removeTwoBtn.classList.remove("lifeline-active");
    removeTwoBtn.classList.add("lifeline-used");
  }

  if (l1 === "1") {
    console.log("l1 is used");
    expertAdviceBtn.classList.remove("lifeline-active");
    expertAdviceBtn.classList.add("lifeline-used");
  }

  if (l2 === "1") {
    console.log("l1 is used");
    flipQ.classList.remove("lifeline-active");
    flipQ.classList.add("lifeline-used");
  }

  questionNum = localStorage.getItem("qnumber");
  var updateQTree = document.getElementById(`prize-${questionNum}`);
  updateQTree.style.color = "goldenrod";
};
