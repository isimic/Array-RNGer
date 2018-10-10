/**
 * @license
 * Copyright (c) 2018 Ilija Simic
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// styles
require("bootstrap/dist/css/bootstrap.min.css")
require("../style/style.css")

// scripts
let $ = require("jquery");
let randomWords = require("random-words"); // https://github.com/punkave/random-words
require("jquery-ui-bundle");

let _toastTimeoutId = -1;

/**
 * Init the event handlers here
 */
$(document).ready(function () {
    $("#generate").on("click", generateArray);
    $("#input-value-type").on("change", checkValueType);
    $("#input-datatype").on("change", checkDataType);
    $("#copy-to-clipboard").on("click", putIntoClipboard);
    $("#close-results").on("click", function () {
        $("#result-container").hide("slide", {
            direction: "up"
        }, 500,
            function () {
                console.log("done");
            });
    });
});


/**
 * Adapts the UI after the value type has been changed
 * @param {Object} e event
 */
function checkValueType(e) {
    if ($(this).val() === "continuous")
        $("#num-of-steps").prop("disabled", true).parent().hide();
    else
        $("#num-of-steps").prop("disabled", false).val(10).parent().show();
}


/**
 * Adapts the UI after the datatype type has been changed
 * @param {Object} e adatap
 */
function checkDataType(e) {
    if ($(this).val() === "string")
        $("#input-value-type").find("option[value='continuous']").hide();
    else
        $("#input-value-type").find("option[value='continuous']").show();

    if ($(this).val() === "integer" || $(this).val() === "float")
        $("#number-range-row").show();
    else
        $("#number-range-row").hide();

    if ($(this).val() === "date")
        $("#date-range-row").show();
    else
        $("#date-range-row").hide();
}



/**
 * starts the generation of the array
 * @param {object} e click event
 */
function generateArray(e) {
    let language = $("#input-language").val();
    let datatype = $("#input-datatype").val();
    let arrayLength = parseInt($("#array-length").val());
    let steps = $("#num-of-steps").is(":visible") ? parseInt($("#num-of-steps").val()) : -1;
    let toClipboard = $("#directly-to-clipboard").is(":checked");
    let from = parseFloat($("#number-from").val());
    let to = parseFloat($("#number-to").val());

    let results = [];

    switch (datatype) {
        case "string":
            results = generateStringArray(arrayLength, steps);
            break;
        case "date":
            let dateFrom = $("#date-from").val();
            let dateTo = $("#date-to").val();
            results = generateDateArray(arrayLength, steps, dateFrom, dateTo);
            break;
        case "integer":
            results = generateNumberArray(arrayLength, steps, true, from, to);
            break;
        case "float":
            results = generateNumberArray(arrayLength, steps, false, from, to);
            break;
    }

    results = createLanguageSpecificArrayString(language, results, datatype);

    $("#result-array").val(results);

    if (toClipboard) {
        putIntoClipboard(results);
    }
    else {
        $("#result-container").toggle("slide", {
            direction: "up"
        }, 500,
            function () {
                console.log("done");
            });
    }
}



/****************************************************************************************
 * Generate an array of random strings with the passed properties
 * @param {number} length the length of the output array
 * @param {number} numOfDifferentValues number of different categories in this array
 */
function generateStringArray(length, numOfDifferentValues) {
    let base = randomWords(numOfDifferentValues);

    let resultArray = new Array(length);
    for (let i = 0; i < resultArray.length; i++) {
        let randIndex = Math.floor(Math.random() * numOfDifferentValues)
        resultArray[i] = '"' + base[randIndex] + '"';
    }
    return resultArray;
}


/****************************************************************************************
 * Generate an array of random dates with the passed properties
 * @param {number} length the length of the output array
 * @param {number} numOfDifferentValues number of different dates in this array. If it is -1 then all dates will be random
 */
function generateDateArray(length, numOfDifferentValues, start, end) {
    let baseDates = [];
    let startDate = new Date(start);
    let endDate = new Date(end);
    let resultArray = new Array(length);

    if (numOfDifferentValues !== -1) {
        baseDates = new Array(numOfDifferentValues);
        for (let i = 0; i < baseDates.length; i++)
            baseDates[i] = randomDate(startDate, endDate);

        for (let i = 0; i < resultArray.length; i++) {
            let randIndex = Math.floor(Math.random() * numOfDifferentValues)
            resultArray[i] = '"' + baseDates[randIndex].toISOString() + '"';
        }
    }
    else {
        for (let i = 0; i < resultArray.length; i++) {
            let date = randomDate(startDate, endDate);
            resultArray[i] = '"' + date.toISOString() + '"';
        }
    }

    return resultArray;
}


/****************************************************************************************
 * SOURCE: https://stackoverflow.com/a/9035732
 * @param {object} start starting date object
 * @param {object} end ending date object
 */
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}


/****************************************************************************************
 * Generate an array of random numbers with the passed properties
 * @param {number} length the length of the output array
 * @param {number} numOfDifferentValues number of different dates in this array. If it is -1 then all dates will be random
 * @param {boolean} isInteger generate only integers
 */
function generateNumberArray(length, numOfDifferentValues, isInteger, min, max) {
    let baseNumbers = [];
    let resultArray = new Array(length);

    if (numOfDifferentValues !== -1) {
        baseNumbers = new Array(numOfDifferentValues);
        for (let i = 0; i < baseNumbers.length; i++) {
            baseNumbers[i] = randNumInRange(min, max);
            if (isInteger)
                baseNumbers[i] = Math.round(baseNumbers[i]);
        }

        for (let i = 0; i < resultArray.length; i++) {
            let randIndex = Math.floor(Math.random() * numOfDifferentValues)
            resultArray[i] = baseNumbers[randIndex];
        }
    }
    else {
        for (let i = 0; i < resultArray.length; i++) {
            let num = randNumInRange(min, max);
            if (isInteger)
                num = Math.round(num);
            resultArray[i] = num;
        }
    }

    return resultArray;
}


/****************************************************************************************
 * returns a random number in a range
 * @param {number} min minimum number
 * @param {number} max maximum number
 */
function randNumInRange(min, max) {
    return Math.random() * (max - min) + min;
}


/****************************************************************************************
 * generates a language specific array of the results array
 * @param {string} language target programming language
 * @param {array} results array with entries
 */
function createLanguageSpecificArrayString(language, results) {
    let arrayDeclaration = ''
    let brackets = {
        "open": "[",
        "close": "]"
    };
    let statementEnding = ";";


    if (language === "cpp" || language === "csharp" || language === "java") {
        brackets["open"] = "{";
        brackets["close"] = "}";
    }
    if (language === "values") {
        brackets["open"] = "";
        brackets["close"] = "";
    }

    switch (language) {
        case "cpp": {
            arrayDeclaration = 'string array[' + results.length + '] = ';
            break;
        }
        case "csharp": {
            arrayDeclaration = 'string[] array = ';
            break;
        }
        case "java": {
            arrayDeclaration = 'String[] array = ';
            break;
        }
        case "javascript": {
            arrayDeclaration = 'let array = ';
            break;
        }
        case "python": {
            arrayDeclaration = 'array = '
            break;
        }
    }

    if (language === "python" || language === "values")
        statementEnding = "";

    return res = arrayDeclaration + brackets.open + results.join(", ") + brackets.close + statementEnding;
}



/****************************************************************************************
 * Puts the passed string into the clipboard and shows the toast message
 * @param {string} text string for clipboard
 */
function putIntoClipboard() {
    $("#toast-container").show("fade", 100);

    let textArea = $("#result-array")[0];

    let toggleVisibility = !$("#result-container").is(":visible")

    if (toggleVisibility) {
        $("#result-container").css("opacity", "0");
        $("#result-container").show();
    }

    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        showToast(successful);
    } catch (err) {
        showToast(false);
    }

    if (toggleVisibility) {
        $("#result-container").hide();
        $("#result-container").css("opacity", "1");
    }
}


/****************************************************************************************
 * displays a toast message, depending if the copy command succeeded or not
 * @param {boolean} success display success or fail message
 */
function showToast(success) {
    let toastMessage = "The generated array is now in your clipboard!";
    let timeout = 2000;
    if (!success) {
        toastMessage = "Could copy array to clipboard! For big arrays, uncheck the 'Directly to Clipboard' option and copy the array manually.";
        timeout = 6000;
    }

    $("#toast-container").find("span").text(toastMessage);
    clearTimeout(_toastTimeoutId);
    _toastTimeoutId = setTimeout(function () {
        _toastTimeoutId = $("#toast-container").hide("fade", 1000);
    }, timeout);
}