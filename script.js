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
  isPrefect: false,
};

document.addEventListener("DOMContentLoaded", init);

// initialize
function init() {
  // start fetching the data

  // search bar
  HTML.currentKeyword = "";
  HTML.searchBar = document.querySelector("#search-bar");
  HTML.searchBar.addEventListener("input", searchKeyword);

  // clear the content of the search bar
  HTML.clearSearchBar = document.querySelector('[data-action="clear"]');
  HTML.clearSearchBar.addEventListener("click", clearSearchBar);

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

  student.middlename = getMiddleName(preparedFullName);
  //console.log(student.middlename);

  student.gender = object.gender;

  student.isPrefect = false;

  student.isExpelled = false;

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

// extract the middle name from a full name
function getMiddleName(fullname) {
  if (
    fullname.substring(fullname.indexOf(" "), fullname.lastIndexOf(" ") + 1) !== " " &&
    fullname.substring(fullname.indexOf(" "), fullname.lastIndexOf(" ") + 1) !== "" &&
    !fullname.includes('"')
  ) {
    return fullname.substring(fullname.indexOf(" "), fullname.lastIndexOf(" ") + 1);
  } else return null;
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

  // allows the user to further narrow down the list by searching
  if (HTML.currentKeyword !== "") {
    //console.log(HTML.currentKeyword);

    const filteredStudentsByKeyword = filteredStudents.filter(matchKeyword);
    filteredStudentsByKeyword.forEach(displayStudent);
  } else {
    filteredStudents.forEach(displayStudent);
  }
}

// filter the array of students based on the current selected filter
function matchFilter(student) {
  if (HTML.currentFilter === "*") {
    return true;

    // only display non-expelled students
  } else if (student.house === HTML.currentFilter) {
    return !student.isExpelled ? true : false;

    // display all non-expelled students
  } else if (HTML.currentFilter === "non-expelled" && !student.isExpelled) {
    return true;

    // display all expelled students
  } else if (HTML.currentFilter === "expelled" && student.isExpelled) {
    return true;
  }

  return false;
}

// filter the array of students by the search bar
function matchKeyword(student) {
  // this condition down below should eliminate the "property is null" bug
  if (student.middlename === null || student.lastname === null) {
    return false;
    //
  } else if (
    student.firstname.toLowerCase().includes(HTML.currentKeyword) ||
    student.middlename.toLowerCase().includes(HTML.currentKeyword) ||
    student.lastname.toLowerCase().includes(HTML.currentKeyword)
  ) {
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

  if (student.isExpelled) {
    clone.querySelector("tr.student").classList.add("expelled");
  }

  // displays the modal when the user clicks on a student
  clone.querySelector("tr.student").addEventListener("click", () => {
    //console.log(student);
    const modal = document.querySelector("#modal");

    modal.querySelector(".modal-image").src = student.image;
    modal.querySelector(".modal-image").alt = `${student.firstname}${student.lastname ? " " + student.lastname : null}`;
    modal.querySelector(".modal-firstname").textContent = student.firstname;
    modal.querySelector(".modal-middlename").textContent = student.middlename ? student.middlename : null;
    modal.querySelector(".modal-lastname").textContent = student.lastname ? student.lastname : null;

    modal.querySelector(".modal-house").textContent =
      student.house.charAt([0]).toUpperCase() + student.house.substring(1);

    // address male students as "Mr. ", and female students as "Mrs. "
    switch (student.gender) {
      case "boy":
        modal.querySelector(".modal-prefix").textContent = "Mr.";
        break;

      case "girl":
        modal.querySelector(".modal-prefix").textContent = "Mrs.";
        break;
    }

    prefect();

    // prefect logic
    function prefect() {
      // keep track of prefects in each
      const allPrefects = [];

      allPrefects.hufflepuff = allStudents.filter((student) => student.isPrefect && student.house === "hufflepuff");
      allPrefects.slytherin = allStudents.filter((student) => student.isPrefect && student.house === "slytherin");
      allPrefects.ravenclaw = allStudents.filter((student) => student.isPrefect && student.house === "ravenclaw");
      allPrefects.gryffindor = allStudents.filter((student) => student.isPrefect && student.house === "gryffindor");

      modal.querySelector('[data-action="prefect"]').addEventListener("click", togglePrefect);

      // appoint and revoke students as prefects
      function togglePrefect() {
        //console.log(allPrefects);

        // if the student is not expelled
        if (!student.isExpelled) {
          // only toggle if there are less than 2 prefects in each house
          if (student.house === "hufflepuff" && allPrefects.hufflepuff.length < 2) {
            student.isPrefect = !student.isPrefect;
          } else if (student.house === "slytherin" && allPrefects.slytherin.length < 2) {
            student.isPrefect = !student.isPrefect;
          } else if (student.house === "ravenclaw" && allPrefects.ravenclaw.length < 2) {
            student.isPrefect = !student.isPrefect;
          } else if (student.house === "gryffindor" && allPrefects.gryffindor.length < 2) {
            student.isPrefect = !student.isPrefect;
          } else student.isPrefect = false;
        }

        // don't make the pop-up close when the user attempts to click on a disabled button
        if (modal.querySelector('[data-action="prefect"]').dataset.prefect !== "disabled") {
          closePopUp();
        }
        displayPrefect();
      }

      // display/update the content in the pop-up
      function displayPrefect() {
        // check if the student is expelled or not
        if (!student.isExpelled) {
          // check if a house exceeds 2 prefects
          if (student.house === "hufflepuff" && allPrefects.hufflepuff.length < 2) {
            // checks if the prefects are the same gender
            if (allPrefects.hufflepuff[0] && student.gender === allPrefects.hufflepuff[0].gender) {
              sameGenderError();
            } else {
              allPrefects.hufflepuff = filterHouse("hufflepuff");
              updatePrefect();
            }
            //
          } else if (student.house === "slytherin" && allPrefects.slytherin.length < 2) {
            // checks if the prefects are the same gender
            if (allPrefects.slytherin[0] && student.gender === allPrefects.slytherin[0].gender) {
              sameGenderError();
            } else {
              allPrefects.slytherin = filterHouse("slytherin");
              updatePrefect();
            }
            //
          } else if (student.house === "ravenclaw" && allPrefects.ravenclaw.length < 2) {
            // checks if the prefects are the same gender
            if (allPrefects.ravenclaw[0] && student.gender === allPrefects.ravenclaw[0].gender) {
              sameGenderError();
            } else {
              allPrefects.ravenclaw = filterHouse("ravenclaw");
              updatePrefect();
            }
            //
          } else if (student.house === "gryffindor" && allPrefects.gryffindor.length < 2) {
            // checks if the prefects are the same gender
            if (allPrefects.gryffindor[0] && student.gender === allPrefects.gryffindor[0].gender) {
              sameGenderError();
            } else {
              allPrefects.gryffindor = filterHouse("gryffindor");
              updatePrefect();
            }

            // allow the user to rewoke a student if they are a prefect
          } else if (student.isPrefect) {
            updatePrefect();

            // when a house already has 2 prefects (or more)
          } else {
            tooManyPrefectsError();
          }

          // if the student is expelled
        } else {
          expelledStudentError();
        }
      }

      // general filter for houses
      function filterHouse(house) {
        return allStudents.filter((student) => student.isPrefect && student.house === house);
      }

      // update the content of the modal
      function updatePrefect() {
        switch (student.isPrefect) {
          case true:
            modal.querySelector(".modal-prefect p").textContent = `${student.firstname} is a prefect.`;
            modal.querySelector('[data-action="prefect"]').dataset.prefect = "remove";
            modal.querySelector('[data-action="prefect"]').textContent = "Revoke as prefect";
            break;

          case false:
            modal.querySelector(".modal-prefect p").textContent = `${student.firstname} is not a prefect.`;
            modal.querySelector('[data-action="prefect"]').dataset.prefect = "add";
            modal.querySelector('[data-action="prefect"]').textContent = "Appoint as prefect";
            break;
        }
      }

      // when a house already has 2 prefects (or more)
      function tooManyPrefectsError() {
        modal.querySelector(".modal-prefect p").textContent = `${student.firstname} is not a prefect.`;
        modal.querySelector('[data-action="prefect"]').dataset.prefect = "disabled";
        modal.querySelector('[data-action="prefect"]').textContent = "Max. 2 prefects per house";
      }

      // expelled students can't be appointed as prefects
      function expelledStudentError() {
        student.isPrefect = false;
        modal.querySelector(".modal-prefect p").textContent = `${student.firstname} is not a prefect.`;
        modal.querySelector('[data-action="prefect"]').dataset.prefect = "disabled";
        modal.querySelector('[data-action="prefect"]').textContent = "Can't appoint expelled students";
      }

      // prefects in the same house must be different genders
      function sameGenderError() {
        student.isPrefect = false;
        modal.querySelector(".modal-prefect p").textContent = `${student.firstname} is not a prefect.`;
        modal.querySelector('[data-action="prefect"]').dataset.prefect = "disabled";
        modal.querySelector('[data-action="prefect"]').textContent = "Prefects cannot be the same gender";
      }

      // expel student
      student.isExpelled
        ? modal.querySelector('[data-action="expel"]').classList.add("disabled")
        : modal.querySelector('[data-action="expel"]').classList.remove("disabled");

      modal.querySelector('[data-action="expel"]').textContent = `${
        !student.isExpelled ? "Expel " + student.firstname : "Already expelled"
      }`;

      modal.querySelector('[data-action="expel"]').addEventListener("click", expelStudent);

      // expel the student and revoke their prefect status
      function expelStudent() {
        student.isPrefect = false;
        student.isExpelled = true;

        if (!modal.querySelector('[data-action="expel"]').classList.contains("disabled")) {
          updatePrefect();
          closePopUp();
        }

        displayData(allStudents);
      }

      // close pop-up when clicked outside of the pop-up
      modal.addEventListener("click", closeModal);
      function closeModal() {
        if (event.target === modal) {
          closePopUp();
        }
      }

      // close the pop up and remove event listeners
      function closePopUp() {
        modal.querySelector('[data-action="prefect"]').removeEventListener("click", togglePrefect);
        modal.querySelector('[data-action="expel"]').removeEventListener("click", expelStudent);

        modal.close();
      }

      displayPrefect();
    }

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

// sorting objects
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

// search by keyword
function searchKeyword() {
  HTML.currentKeyword = HTML.searchBar.value.toLowerCase();
  displayData(allStudents);
}

// clear the content of the search bar
function clearSearchBar() {
  HTML.searchBar.value = "";
  HTML.currentKeyword = HTML.searchBar.value.toLowerCase();
  displayData(allStudents);
}
