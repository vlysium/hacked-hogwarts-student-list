"use strict";
const dataEndPoint = "https://petlatkea.dk/2021/hogwarts/students.json";
const rawStudentsJSON = {};
const cleanedStudentsJSON = {};

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
}

//clean up the data into a more desirable format
function cleanData() {
  //prototype
  const Student = {
    firstname: "",
    lastname: "",
    middlename: "",
    nickname: "",
    image: "",
    house: "",
  };

  //create new objects
  rawStudentsJSON.data.forEach((json) => {
    const student = Object.create(Student);

    const preparedName = prepareData(json.fullname);

    const preparedHouse = prepareData(json.house);
    //console.log(preparedName);
    console.log(preparedHouse);
  });
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

/*
student.firstname = trimmedFullName.substring(
      0,
      trimmedFullName.includes(" ") ? trimmedFullName.indexOf(" ") : trimmedFullName.length
    );
    console.log(student.firstname);
*/
