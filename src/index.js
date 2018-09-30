var $ = require("jquery");
var randomWords = require("random-words"); // https://github.com/punkave/random-words

parent.randomWords = randomWords;
parent.$ = require("jquery");
require("jquery-ui-bundle");


let _toastTimeoutId = -1;

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
    console.log("start");
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
    for(let i = 0; i < resultArray.length; i++) {
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
    let res = '';
    switch (language) {
        case "javascript" : {
            res = 'let array = [' + results.join(", ") + ']';
            break;
        }
    }
    return res;
}



/****************************************************************************************
 * Puts the passed string into the clipboard and shows the toast message
 * @param {string} text string for clipboard
 */
function putIntoClipboard(text) {
    console.log("TODO: put results into clipboard");
    $("#toast-container").show("fade", 100);
    copyTextToClipboard(text);
    clearTimeout(_toastTimeoutId);
    _toastTimeoutId = setTimeout(function () {
        _toastTimeoutId = $("#toast-container").hide("fade", 1000);
    }, 2000);
}


/****************************************************************************************
 * Puts text into clipboard
 * SOURCE: https://stackoverflow.com/a/30810322;
 * @param {string} text 
 */
function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");

    //
    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if element was to flash render it has minimal visual impact.
    // 3. less flakyness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a flash,
    // so some of these are just precautions. However in IE the element
    // is visible whilst the popup box asking the user for permission for
    // the web page to copy to the clipboard.
    //

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';


    textArea.value = text;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
}
