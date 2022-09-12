"use strict";
const dataEndPoint = "https://petlatkea.dk/2021/hogwarts/students.json"; //json endpoint
const rawStudentsJSON = []; //raw data fetched from the endpoint
const cleanedStudentsJSON = []; // cleaned raw data

document.addEventListener("DOMContentLoaded", init);

//initialize
function init() {
  fetchData();
}

//fetch the raw json data from the end point
async function fetchData() {
  const response = await fetch(dataEndPoint);
  rawStudentsJSON.data = await response.json();
  cleanData();
  //console.log(rawStudentsJSON.data);
}

//clean up the data into a more desirable format
function cleanData() {
  //prototype
  const Student = {
    firstname: "",
    lastname: "",
    middlename: null,
    nickname: null,
    image: null,
    house: "",
  };

  //create new objects
  rawStudentsJSON.data.forEach((json) => {
    const preparedFullName = prepareData(json.fullname);
    //console.log(preparedFullName);

    const preparedHouse = prepareData(json.house);
    //console.log(preparedHouse);

    const student = Object.create(Student);

    student.firstname = getFirstName(preparedFullName);
    //console.log(student.firstname);

    student.lastname = getLastName(preparedFullName);
    //console.log(student.lastname);

    student.house = preparedHouse;

    cleanedStudentsJSON.push(student);
  });

  console.table(cleanedStudentsJSON);
}

//this general function prepares the data by removing excess whitespace and capitalize names properly
function prepareData(data) {
  //regex that captures the first letter and all lower case letters after a space, dash or a quotation mark
  const regex = /(?<=(-| |"))[a-z]/g;

  //remove excess whitespace
  const trimmedString = data.trim();

  //make all letters lowercase
  const lowerCaseString = trimmedString.toLowerCase();

  //capitalize the first letter of a name
  const capitalizeString =
    lowerCaseString.charAt([0]).toUpperCase() +
    lowerCaseString
      .replace(regex, function (character) {
        return character.toUpperCase();
      })
      .substring(1);

  return capitalizeString;
}

//extract the first name from a full name
function getFirstName(fullName) {
  return fullName.substring(0, fullName.includes(" ") ? fullName.indexOf(" ") : fullName.length);
}

//extract the last name from a full name
function getLastName(fullName) {
  return fullName.includes(" ") ? fullName.substring(fullName.lastIndexOf(" ") + 1) : null;
}
