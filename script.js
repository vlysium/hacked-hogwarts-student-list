"use strict";

const dataEndPoint = "https://petlatkea.dk/2021/hogwarts/students.json"; // json endpoint
let allStudents = []; // cleaned data fetched from the endpoint
const HTML = []; // global variables

// prototype
const Student = {
  firstname: "",
  lastname: "",
  middlename: null,
  gender: null,
  nickname: null,
  image: null,
  house: "",
  isExpelled: false,
};

document.addEventListener("DOMContentLoaded", init);

// initialize
function init() {
  // start fetching the data

  // filtering
  HTML.currentFilter = "*";
  HTML.buttons = document.querySelectorAll(".filter");
  HTML.buttons.forEach((button) => button.addEventListener("click", filterStudents));

  // sorting
  HTML.currentSorting = "";
  HTML.sorting = document.querySelectorAll('[data-action="sort"]');
  HTML.sorting.forEach((button) => button.addEventListener("click", sortObjects));

  fetchData();
}

// set the filter to the corresponding button
function filterStudents() {
  HTML.currentFilter = this.dataset.filter;
  //console.log(HTML.currentFilter);

  // move the .selected class to the current button selected
  HTML.buttons.forEach((button) => button.classList.remove("selected"));
  this.classList.add("selected");

  displayData(allStudents);
}

// fetch the raw json data from the end point
async function fetchData() {
  const response = await fetch(dataEndPoint);
  const jsonData = await response.json();
  cleanData(jsonData);
  //console.log(jsonData);
}

// clean up the data into a more desirable format
function cleanData(jsonData) {
  allStudents = jsonData.map(prepareObjects);
  //console.table(allStudents);

  displayData(allStudents);
}

// this function fixes capitalization and whitespace
function prepareObjects(object) {
  // create new objects
  const preparedFullName = prepareData(object.fullname);
  //console.log(preparedFullName);

  const preparedHouse = prepareData(object.house);
  //console.log(preparedHouse);

  const student = Object.create(Student);

  student.firstname = getFirstName(preparedFullName);
  //console.log(student.firstname);

  student.lastname = getLastName(preparedFullName);
  //console.log(student.lastname);

  student.gender = object.gender;

  student.image = `images/${getImageName(student)}.png`;

  student.house = preparedHouse.toLowerCase();

  return student;
}

// this general function prepares the data by removing excess whitespace and capitalize names properly
function prepareData(data) {
  // regex that captures the first letter and all lower case letters after a space, dash or a quotation mark
  const regex = /(?<=(-| |"))[a-z]/g;

  // remove excess whitespace
  const trimmedString = data.trim();

  // make all letters lowercase
  const lowerCaseString = trimmedString.toLowerCase();

  // capitalize the first letter of a name
  const capitalizeString =
    lowerCaseString.charAt([0]).toUpperCase() +
    lowerCaseString
      .replace(regex, function (character) {
        return character.toUpperCase();
      })
      .substring(1);

  return capitalizeString;
}

// extract the first name from a full name
function getFirstName(fullName) {
  return fullName.substring(0, fullName.includes(" ") ? fullName.indexOf(" ") : fullName.length);
}

// extract the last name from a full name
function getLastName(fullName) {
  return fullName.includes(" ") ? fullName.substring(fullName.lastIndexOf(" ") + 1) : null;
}

// this function points to the correct image of the student
function getImageName(student) {
  let imageName = `${student.lastname ? student.lastname : "default"}_${
    student.firstname === "Padma"
      ? "Padma"
      : student.firstname === "Parvati"
      ? "Parvati"
      : student.firstname === "Leanne"
      ? "image"
      : student.firstname.charAt([0])
  }`;

  student.firstname.charAt([0]);

  return imageName.toLowerCase();
}

// display a list of students matching the filter
function displayData(students) {
  document.querySelector("#list tbody").innerHTML = "";

  const filteredStudents = students.filter(matchFilter);

  filteredStudents.forEach(displayStudent);
}

// filter the array of students based on the current selected filter
function matchFilter(student) {
  if (student.house === HTML.currentFilter || HTML.currentFilter === "*") {
    return true;
  }
  return false;
}

// clone the template and append to the document
function displayStudent(student) {
  // clone template
  const clone = document.querySelector("template#student-template").content.cloneNode(true);

  clone.querySelector("[data-field=image]").style.backgroundImage = `url(${student.image})`;
  clone.querySelector("[data-field=firstname]").textContent = student.firstname;
  clone.querySelector("[data-field=house]").textContent =
    student.house.charAt([0]).toUpperCase() + student.house.substring(1);

  // checks if the student has a last name, otherwise assign "( unknown )" if the student doesn't have a last name
  clone.querySelector("[data-field=lastname]").textContent = student.lastname ? student.lastname : "( unknown )";
  if (clone.querySelector("[data-field=lastname]").textContent === "( unknown )") {
    clone.querySelector("[data-field=lastname]").classList.add("unknown");
  }

  // displays the modal when the user clicks on a student
  clone.querySelector("tr.student").addEventListener("click", () => {
    //console.log(student);
    const modal = document.querySelector("#modal");

    modal.querySelector(".modal-image").src = student.image;
    modal.querySelector(".modal-image").alt = `${student.firstname}${student.lastname ? " " + student.lastname : null}`;
    modal.querySelector(".modal-firstname").textContent = student.firstname;
    modal.querySelector(".modal-lastname").textContent = student.lastname ? student.lastname : null;

    // refer male students as "Mr. ", and female students as "Mrs. "
    switch (student.gender) {
      case "boy":
        modal.querySelector(".modal-prefix").textContent = "Mr.";
        break;

      case "girl":
        modal.querySelector(".modal-prefix").textContent = "Mrs.";
        break;
    }

    // close pop-up when clicked outside of the pop-up
    modal.addEventListener("click", () => {
      if (event.target === modal) modal.close();
    });

    // display pop-up
    modal.showModal();
  });

  // append clone
  document.querySelector("#list tbody").appendChild(clone);
}

// compare objects and sort the list
function sortObjects() {
  // set the current sorting
  HTML.currentSorting = this.dataset.sort;

  allStudents.sort(compareObjects);

  // assign the .selected class to the current selected sorting button
  HTML.sorting.forEach((button) => button.classList.remove("selected"));
  this.classList.add("selected");

  // toggle between ascending and descending
  switch (this.dataset.sortDirection) {
    case "ascending":
      this.dataset.sortDirection = "descending";
      allStudents.reverse();
      displayData(allStudents);
      break;

    case "descending":
      this.dataset.sortDirection = "ascending";
      displayData(allStudents);
      break;
  }
}

// comparison
function compareObjects(a, b) {
  switch (HTML.currentSorting) {
    case "firstname":
      return a.firstname < b.firstname ? -1 : 1;

    case "lastname":
      return a.lastname < b.lastname ? -1 : 1;

    case "house":
      return a.house < b.house ? -1 : 1;
  }
}
