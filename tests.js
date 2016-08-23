// Usage:
// $ phantomjs tests.js


var page = require('webpage').create();
var url = 'src/index.html';
var testMaxTime = 5000;

page.onResourceError = function(e) {
    console.log("Error loading " + e.url);
    phantom.exit();
}

function fail() {
    console.log("Failed");
    phantom.exit();
}

function waitForGenerate(fn, maxTime) {
    if (!maxTime) {
        maxTime = testMaxTime;
    }
    var start = new Date().getTime();
    var prevAddressCount = -1;
    var wait = function keepWaiting() {
        var now = new Date().getTime();
        var hasTimedOut = now - start > maxTime;
        var addressCount = page.evaluate(function() {
            return $(".address").length;
        });
        var hasFinished = addressCount > 0 && addressCount == prevAddressCount;
        prevAddressCount = addressCount;
        if (hasFinished) {
            fn();
        }
        else if (hasTimedOut) {
            console.log("Test timed out");
            fn();
        }
        else {
            setTimeout(keepWaiting, 100);
        }
    }
    wait();
}

function next() {
    if (tests.length > 0) {
        var testsStr = tests.length == 1 ? "test" : "tests";
        console.log(tests.length + " " + testsStr + " remaining");
        tests.shift()();
    }
    else {
        console.log("Finished with 0 failures");
        phantom.exit();
    }
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 * See http://stackoverflow.com/a/12646864
 */
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

tests = [

// Page loads with status of 'success'
function() {
page.open(url, function(status) {
    if (status != "success") {
        console.log("Page did not load with status 'success'");
        fail();
    }
    next();
});
},

// Page has text
function() {
page.open(url, function(status) {
    var content = page.evaluate(function() {
        return document.body.textContent.trim();
    });
    if (!content) {
        console.log("Page does not have text");
        fail();
    }
    next();
});
},

// Entering mnemonic generates addresses
function() {
page.open(url, function(status) {
    var expected = "1Di3Vp7tBWtyQaDABLAjfWtF6V7hYKJtug";
    // set the phrase
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability").trigger("input");
    });
    // get the address
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Mnemonic did not generate address");
            console.log("Expected: " + expected);
            console.log("Got: " + actual);
            fail();
        }
        next();
    });
});
},

// Random button generates random mnemonic
function() {
page.open(url, function(status) {
    // check initial phrase is empty
    var phrase = page.evaluate(function() {
        return $(".phrase").text();
    });
    if (phrase != "") {
        console.log("Initial phrase is not blank");
        fail();
    }
    // press the 'generate' button
    page.evaluate(function() {
        $(".generate").click();
    });
    // get the new phrase
    waitForGenerate(function() {
        var phrase = page.evaluate(function() {
            return $(".phrase").val();
        });
        if (phrase.length <= 0) {
            console.log("Phrase not generated by pressing button");
            fail();
        }
        next();
    });
});
},

// Mnemonic length can be customized
function() {
page.open(url, function(status) {
    // set the length to 6
    var expectedLength = "6";
    page.evaluate(function() {
        $(".strength option[selected]").removeAttr("selected");
        $(".strength option[value=6]").prop("selected", true);
    });
    // press the 'generate' button
    page.evaluate(function() {
        $(".generate").click();
    });
    // check the new phrase is six words long
    waitForGenerate(function() {
        var actualLength = page.evaluate(function() {
            var words = $(".phrase").val().split(" ");
            return words.length;
        });
        if (actualLength != expectedLength) {
            console.log("Phrase not generated with correct length");
            console.log("Expected: " + expectedLength);
            console.log("Actual: " + actualLength);
            fail();
        }
        next();
    });
});
},

// Passphrase can be set
function() {
page.open(url, function(status) {
    // set the phrase and passphrase
    var expected = "15pJzUWPGzR7avffV9nY5by4PSgSKG9rba";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".passphrase").val("secure_passphrase").trigger("input");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Passphrase results in wrong address");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to bitcoin testnet
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "mucaU5iiDaJDb69BHLeDv8JFfGiyg2nJKi";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=1]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Bitcoin testnet address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to litecoin
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "LQ4XU8RX2ULPmPq9FcUHdVmPVchP9nwXdn";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=2]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Litecoin address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to dogecoin
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "DPQH2AtuzkVSG6ovjKk4jbUmZ6iXLpgbJA";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=3]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Dogecoin address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to shadowcash
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "SiSZtfYAXEFvMm3XM8hmtkGDyViRwErtCG";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=4]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Shadowcash address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to shadowcash testnet
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "tM2EDpVKaTiEg2NZg3yKg8eqjLr55BErHe";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=5]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Shadowcash testnet address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to viacoin
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "Vq9Eq4N5SQnjqZvxtxzo7hZPW5XnyJsmXT";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=6]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Viacoin address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to viacoin testnet
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "tM2EDpVKaTiEg2NZg3yKg8eqjLr55BErHe";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=7]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Viacoin testnet address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to jumbucks
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "JLEXccwDXADK4RxBPkRez7mqsHVoJBEUew";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=8]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("Jumbucks address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Network can be set to clam
function() {
page.open(url, function(status) {
    // set the phrase and coin
    var expected = "xCp4sakjVx4pUAZ6cBCtuin8Ddb6U1sk9y";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
        $(".network option[selected]").removeAttr("selected");
        $(".network option[value=9]").prop("selected", true);
        $(".network").trigger("change");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".address:first").text();
        });
        if (actual != expected) {
            console.log("CLAM address is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// BIP39 seed is set from phrase
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "20da140d3dd1df8713cefcc4d54ce0e445b4151027a1ab567b832f6da5fcc5afc1c3a3f199ab78b8e0ab4652efd7f414ac2c9a3b81bceb879a70f377aa0a58f3";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".seed").val();
        });
        if (actual != expected) {
            console.log("BIP39 seed is incorrectly generated from mnemonic");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// BIP32 root key is set from phrase
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "xprv9s21ZrQH143K2jkGDCeTLgRewT9F2pH5JZs2zDmmjXes34geVnFiuNa8KTvY5WoYvdn4Ag6oYRoB6cXtc43NgJAEqDXf51xPm6fhiMCKwpi";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // check the address is generated correctly
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".root-key").val();
        });
        if (actual != expected) {
            console.log("Root key is incorrectly generated from mnemonic");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// Tabs show correct addresses when changed
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "17uQ7s2izWPwBmEVFikTmZUjbBKWYdJchz";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // change tabs
    waitForGenerate(function() {
        page.evaluate(function() {
            $("#bip32-tab a").click();
        });
        // check the address is generated correctly
        waitForGenerate(function() {
            var actual = page.evaluate(function() {
                return $(".address:first").text();
            });
            if (actual != expected) {
                console.log("Clicking tab generates incorrect address");
                console.log("Expected: " + expected);
                console.log("Actual: " + actual);
                fail();
            }
            next();
        });
    });
});
},

// BIP44 derivation path is shown
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "m/44'/0'/0'/0";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // check the derivation path of the first address
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $("#bip44 .path").val();
        });
        if (actual != expected) {
            console.log("BIP44 derivation path is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// BIP44 extended private key is shown
function() {
page.open(url, function(status) {
    // set the phrase
    var expected = "xprvA2DxxvPZcyRvYgZMGS53nadR32mVDeCyqQYyFhrCVbJNjPoxMeVf7QT5g7mQASbTf9Kp4cryvcXnu2qurjWKcrdsr91jXymdCDNxKgLFKJG";
    page.evaluate(function() {
        $(".phrase").val("abandon abandon ability");
        $(".phrase").trigger("input");
    });
    // check the derivation path of the first address
    waitForGenerate(function() {
        var actual = page.evaluate(function() {
            return $(".extended-priv-key").val();
        });
        if (actual != expected) {
            console.log("BIP44 extended private key is incorrect");
            console.log("Expected: " + expected);
            console.log("Actual: " + actual);
            fail();
        }
        next();
    });
});
},

// BIP44 extended public key is shown
// BIP44 purpose field changes address list
// BIP44 coin field changes address list
// BIP44 account field changes address list
// BIP44 external/internal field changes address list

// BIP32 derivation path can be set
// BIP32 can use hardened derivation paths
// BIP32 extended private key is shown
// BIP32 extended public key is shown

// Derivation path is shown in table
// Derivation path for address can be hardened
// Derivation path visibility can be toggled
// Address is shown
// Addresses are shown in order of derivation path
// Address visibility can be toggled
// Private key is shown
// Private key visibility can be toggled

// More addresses can be generated
// A custom number of additional addresses can be generated
// Additional addresses are shown in order of derivation path

// BIP32 root key can be set by the user
// Setting BIP32 root key clears the existing phrase, passphrase and seed
// Clearing of phrase, passphrase and seed can be cancelled by user
// Custom BIP32 root key is used when changing the derivation path

// Incorrect mnemonic shows error
// Incorrect word shows suggested replacement
// Incorrect BIP32 root key shows error
// Derivation path not starting with m shows error
// Derivation path containing invalid characters shows useful error

// Github Issue 11: Default word length is 15
// https://github.com/dcpos/bip39/issues/11

// Github Issue 12: Generate more rows with private keys hidden
// https://github.com/dcpos/bip39/issues/12

// Github Issue 19: Mnemonic is not sensitive to whitespace
// https://github.com/dcpos/bip39/issues/19

// Github Issue 23: Use correct derivation path when changing tabs
// https://github.com/dcpos/bip39/issues/23

];

console.log("Running tests...");
tests = shuffle(tests);
next();
