var $ = require("jquery");
var randomWords = require("random-words"); // https://github.com/punkave/random-words
require("jquery-ui-bundle");
let _toastTimeoutId = -1;

parent.$ = require("jquery");


/**
 * Init the event handlers here
 */
$(document).ready(function () {
    $("#generate").on("click", generateArray);
    $("#input-value-type").on("change", checkValueType);
    $("#input-datatype").on("change", checkDataType);
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
}


function generateArray(e) {
    let language = $("#input-language").val();
    let datatype = $("#input-datatype").val();
    let arrayLength = parseInt($("#array-length").val());
    let valueType = $("#input-value-type").val();
    let steps = parseInt($("#num-of-steps").val());
    let toClipboard = $("#directly-to-clipboard").is(":checked");

    let results = generateStringArray(arrayLength, steps);
    results = generateLanguageSpecificArrayString(language, results);

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
 * @param {number} categoriesNumber number of different categories in this array
 */
function generateStringArray(length, categoriesNumber) {
    let base = randomWords(categoriesNumber);

    let resultArray = new Array(length);
    for (let i = 0; i < resultArray.length; i++) {
        let randIndex = Math.floor(Math.random() * categoriesNumber)
        resultArray[i] = '"' + base[randIndex] + '"';
    }
    return resultArray;
}


/****************************************************************************************
 * generates a language specific array of the results array
 * @param {string} language target programming language
 * @param {array} results array with entries
 */
function generateLanguageSpecificArrayString(language, results) {
    let arrayDeclaration = ''
    let brackets = {
        "open": "[",
        "close": "]"
    };
    if (language === "cpp" || language === "csharp" || language === "java") {
        brackets["open"] = "{";
        brackets["close"] = "}";
    }

    switch (language) {
        case "cpp": {
            arrayDeclaration = 'string array[' + results.length + ']';
            break;
        }
        case "csharp": {
            arrayDeclaration = 'string[] array';
            break;
        }
        case "java": {
            arrayDeclaration = 'String[] array';
            break;
        }
        case "javascript": {
            arrayDeclaration = 'let array';
            break;
        }
        case "python": {
            arrayDeclaration = 'array'
            break;
        }
    }

    return res = arrayDeclaration + " = " + brackets.open + results.join(", ") + brackets.close + (language !== "python" ? ";" : "");
}



/****************************************************************************************
 * Puts the passed string into the clipboard and shows the toast message
 * @param {string} text string for clipboard
 */
function putIntoClipboard(text) {
    $("#toast-container").show("fade", 100);
    // copyTextToClipboard(text);


    let textArea = $("#result-array")[0];
    $("#result-container").css("opacity", "0");
    $("#result-container").show();

    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        showToast(successful);
    } catch (err) {
        showToast(false);
    }
    $("#result-container").hide();
    $("#result-container").css("opacity", "1");


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