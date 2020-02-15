/*jshint esversion: 6 */
let end_url = "https://www.prolific.co/";
document.addEventListener("DOMContentLoaded", function() {
    if (mobile()) {
        alert(
            "You seem to be using a smartphone or tablet. \nUnfortunately you cannot do this experiment on a mobile device. \nPlease start the experiment again with a normal webbrowser on your computer."
        );
        window.location = end_url;
    }
    prep_cond();
    listeners();
    document.getElementById('consent').style.display = 'block'; // default: consent feedback typingdiv
});

function consented() {
    document.getElementById('consent').style.display = 'none';
    document.getElementById('intro').style.display = 'block';
    window.consent_now = Date.now();
}

let sctn = 0;
let trial = 0;
let keysup, keysdown;

function nexttrial() {
    document.getElementById('intro').style.display = 'none';
    document.getElementById('typingdiv').style.display = 'none';
    document.getElementById('newsection').style.display = 'none';
    document.getElementById('feedback').style.display = 'none';
    if (sections[sctn].length > 0) {
        trial++;
        keysup = [];
        keysdown = [];
        window.testitem = sections[sctn].shift();
        document.getElementById('tomemorize').textContent = testitem[0];
        document.getElementById('memorize').style.display = 'block';
    } else {
        if (sctn < sections.length) {
            sctn++;
            if (sctn === fakedsection) {
                add_f = "f";
            } else {
                add_f = "";
            }
            trial = 0;
            document.getElementById('newsection').style.display = 'block';
            document.getElementById('section_text').innerHTML = blocktexts.shift();
        } else {
            document.getElementById('motiv_id').style.display = 'block';
        }
    }
}

function validate() {
    let feed = [];
    window.entered = document.getElementById("input_id").value;
    let orig = testitem[0];
    window.similarity = similar_text(entered, orig, true);
    words_ori = orig.split(' ').length;
    words_ent = entered.split(' ').length;
    chars_ori = orig.replace(/[^a-zA-Z]+/g, '');
    chars_ent = entered.replace(/[^a-zA-Z]+/g, '');
    let feedwait = 2000;
    if (similarity < 25) {
        feed.push("What you wrote seems completely different from the original sentence. Please memorize and enter the sentences properly.");
    } else if (similarity < 50) {
        feed.push("What you wrote seems very different from the original sentence. Please memorize and enter the sentences properly.");
    } else if (similarity < 75) {
        feed.push("The sentence you wrote seems quite different from the original sentence. Please memorize and enter the sentences properly.");
    } else if (similarity < 90) {
        feed.push("The sentence you wrote has too many differences from the original sentence. Please pay closer attention.");
        feedwait = 0;
    }
    if (words_ori - words_ent > 1) {
        feed.push("The original sentence had " + words_ori + " words, but you only wrote " + words_ent + ". Please try to properly recall and enter the full sentence on each trial.");
    } else if (chars_ent.length * 2 / 3 > chars_ori.length) {
        feed.push("The original sentence was much longer than what you wrote. Please try to recall and enter the full sentence on each trial.");
        feedwait += 2000;
    }
    if (feed.length > 0) {
        add_response('0');
        document.getElementById("feed_okbutton").disabled = true;
        document.getElementById("feed_id").innerHTML = feed.join("<br><br>");
        document.getElementById('typingdiv').style.display = 'none';
        document.getElementById('feedback').style.display = 'block';
        setTimeout(() => {
            document.getElementById("feed_okbutton").disabled = false;
        }, feedwait);
    } else {
        add_response('1');
        nexttrial();
    }
}

let start;
let listenkey = false;

function start_typing() {
    document.getElementById('memorize').style.display = 'none';
    document.getElementById("input_id").value = "";
    setTimeout(() => {
        start = now();
        document.getElementById('typingdiv').style.display = 'block';
        document.getElementById("input_id").focus();
        listenkey = true;
    }, 100);
}

function listeners() {
    document.getElementById('input_id').addEventListener('keydown', function(e) {
        let time = now() - start;
        time = Math.round(time * 1000);
        let keycode = e.which || e.keyCode || 0;
        let key;
        if (listenkey) {
            if (e.code === "Space") {
                key = "Space";
            } else {
                key = e.key;
            }
        }
        keysdown.push(key + '&' + e.code + '&' + keycode + '&' + time);
    });
    document.getElementById('input_id').addEventListener('keyup', function(e) {
        let time = now() - start;
        time = Math.round(time * 1000);
        let keycode = e.which || e.keyCode || 0;
        let key;
        if (listenkey) {
            if (e.code === "Space") {
                key = "Space";
            } else {
                key = e.key;
            }
        }
        keysup.push(key + '&' + e.code + '&' + keycode + '&' + time);
    });

    document.addEventListener('keyup', function(e) {
        let keycode = e.which || e.keyCode || 0;
        if (e.key === 'Enter' || keycode === 13) {
            if (document.getElementById('memorize').style.display === 'block') {
                start_typing();
            } else if (document.getElementById('typingdiv').style.display === 'block' && document.getElementById("input_id").value.length > 4) {
                listenkey = false;
                validate();
            }
        }
    });

    document.getElementById('typingdiv').onpaste = function(e) {
        e.preventDefault();
    };
    ['ondrop', 'onpaste', 'oncopy', 'oncut'].forEach(on_ev => {
        document.getElementById('typingdiv')[on_ev] = function(e) {
            e.preventDefault();
        };
    });
}

function neat_date() {
    var m = new Date();
    return m.getFullYear() + "" +
        ("0" + (m.getMonth() + 1)).slice(-2) + "" +
        ("0" + m.getDate()).slice(-2) + "" +
        ("0" + m.getHours()).slice(-2) + "" +
        ("0" + m.getMinutes()).slice(-2) + "" +
        ("0" + m.getSeconds()).slice(-2);
}

function rchoice(array) {
    return array[Math.floor(array.length * Math.random())];
}

var subject_id =
    rchoice("CDFGHJKLMNPQRSTVWXZ") +
    rchoice("AEIOUY") +
    rchoice("CDFGHJKLMNPQRSTVWXZ") + '_' + neat_date();

function prep_cond() {
    window.fakedsection = rchoice([1, 2, 3]);
    let beginning = "The remaining test will be the same, but it will consist of three sections. You will receive instructions before each section separately.<br><br>";
    let fakeit = "<b>please try to fake your way of typing</b>. It is up to you how you do this. This represents a situation where you engage in a serious illegal activity while using your computer (e.g. drafting a plan for a terrorist attack or arranging a contract murder via chat messages) and it is important for you to hide your identity, which may be detected based on the way you type. Therefore, you want to type differently from how you normally would.";
    window.blocktexts = ["<b>please type just as you normally would</b>. This represents a scenario where you simply use the computer in a regular situation (e.g. drafting a document for your legal work or writing casual chat messages) and you have nothing important to hide.", "<b>again please type just as you normally would</b>. (This again represents a scenario where you simply use the computer in a regular situation and you have nothing important to hide.)"];
    blocktexts.splice(fakedsection - 1, 0, fakeit);
    ['first', 'second', 'third'].forEach((sectnum, indx) => {
        blocktexts[indx] = 'In this ' + sectnum + ' section, ' + blocktexts[indx];
    });
    blocktexts[0] = beginning + blocktexts[0];
}

// shuffle array function
function shuffle(arr) {
    var array = JSON.parse(JSON.stringify(arr));
    var newarr = [];
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        newarr[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return newarr;
}


function endtask() {
    document.getElementById('motiv_id').style.display = 'none';
    document.getElementById('end_id').style.display = 'block';
    var duration_full = Math.round((Date.now() - consent_now) / 600) / 100;
    subject_results += 'dems\t' + [
            'subject_id',
            'fakedsection',
            'browser_name',
            'browser_version',
            'effort',
            'full_dur'
        ].join('/') +
        '\t' + [
            subject_id,
            fakedsection,
            browser[0],
            browser[1],
            document.getElementById("effort_id").value,
            duration_full
        ].join('/');
    window.f_name =
        'kb_id_' +
        subject_id +
        ".txt";
    upload();
}

function upload() {
    fetch('https://homepage.univie.ac.at/gaspar.lukacs/kb_id/kb_id.php', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            },
            body: JSON.stringify({
                fname_post: f_name,
                results_post: subject_results
            })
        })
        .then(response => response.text())
        .then(echoed => {
            console.log(echoed);
            if (echoed.startsWith("Fail")) {
                document.getElementById('div_end_error').style.display = 'block';
                document.getElementById('pass_pre').style.color = 'red';
                document.getElementById('pass_pre').innerHTML = echoed;
            } else {
                document.getElementById('pass_id').innerHTML = '<a href="' + echoed + '" target="_blank" rel="noopener noreferrer">' + echoed + '</a>';
            }
        })
        .catch((error) => {
            console.log('Request failed: ', error);
            document.getElementById('pass_pre').style.color = 'red';
            document.getElementById('pass_pre').innerHTML = 'Server connection failed! ' + error;
            document.getElementById('div_end_error').style.display = 'block';
        });
}

function dl_as_file() {
    var blobx = new Blob([subject_results], {
        type: 'text/plain'
    });
    var elemx = window.document.createElement('a');
    elemx.href = window.URL.createObjectURL(blobx);
    elemx.download = f_name;
    document.body.appendChild(elemx);
    elemx.click();
    document.body.removeChild(elemx);
}

var browser = (function() {
    var ua = navigator.userAgent,
        tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge?)\/(\d+)/);
        if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera').replace('Edg ', 'Edge ');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M;
})();

function mobile() {
    return (window.matchMedia("only screen and (max-width: 590px)").matches);
}


var now = function() {
    var performance = window.performance || {};
    performance.now = (function() {
        return (
            performance.now ||
            performance.webkitNow ||
            performance.msNow ||
            performance.oNow ||
            performance.mozNow ||
            function() {
                return new Date().getTime();
            }
        );
    })();
    return performance.now();
};

let texts_informal = ["all i want is to find the man i love.", "all my life i said i wanted to get to this one!", "among languages, it is best never to meet.", "and then they go out to the bogs and marshes", "asked if i thought it would be for vanity's sake.", "because the procedure can be used for anything", "claiming that we are here to see her.", "come on, i don’t have any comments.", "finished working on the house in those days.", "found out how to put it all together.", "go through all, and see if he'll carry it.", "he kept trying to get a haircut!", "he opened the door to speak to you.", "he recorded it a few days after reading", "he recorded it a few days ago.", "he spoke the last word in any argument.", "he told them to knock it off and take a step up.", "i constantly tried to get into your house.", "i didn’t know where i was gonna go.", "i don’t know how it is that wrinkles don't hurt.", "i don’t know how to find him.", "i had, it is true, told her that she should", "i hope you can keep up! lets go!", "i let go, and he fell in love.", "i like life on the home front.", "i really don’t want to be that guy.", "i told them to knock it off and take a step up.", "it was a long walk back to my barracks", "it's hard to find a vampire at her side.", "just try it for a long trip home", "life is going to change the future.", "maybe we did have a dramatic quality.", "mine are the ones that might be too", "omg haha i should be asking you.", "or muscatel, on the other side of the wall.", "our souls in such a short time", "reserved for members of the families he butchered.", "she stops in the middle of the road.", "sometimes we stopped to take a step up!", "teach him how to fish, and he will eat for a day.", "that is classic. and i must enact every cliche.", "the cave was the home of a missionary.", "the next day he hears a knock on the door again.", "thirty-five percent of the speed", "too bad there's not a way to tie this in nicely.", "we slipped through the filter.", "we won’t be able to get local agriculture", "we're not out of this ship", "when i had told her all that i needed to move on.", "you found a way to shout louder", "you'd be interested in the study in england"];

let texts_formal = ["adequate charges to cover the card", "ambassador to the united states.", "analysis of the first theme in the recapitulation", "and also i will be making a powerpoint.", "at last you won't be inundated with solicitations.", "at one time it was a means of portraiture", "auction book from last year's $1.55 billion.", "away to protect ocean wildlife.", "bring binoculars for the annual maiden’s festival.", "cannot afford to have a tree-lined boulevard", "coordinated events such as film festivals.", "dramatically improve the lives of at-risk youth", "emphasized that it was not until 1829", "example 2: harmonic structure of this movement.", "has been referred to as privileged", "have access to the information", "he said that they had overstayed", "homosexual, and founder of the chinese peasantry.", "honors the founder of the first movement", "however, it is at the very end of the city.", "i think that there are logical sub-figures", "i wanted to be a natural behavior.", "if you want to have a formidable adversary", "in-nest navigation will be a very simple function.", "intensity ratio of d1 over d2 was 1.6.", "it is fascinating to watch the bananas grow.", "it is time to move to a ‘maintenance’ stage.", "it strays from reason in the way of amending ab1x.", "most say they're driven by the 2.2% absolute", "my house was built in 1931", "next, we will cite some of the analysis", "once again, please accept my personal “thank you!”", "people may not need to cause a crisis.", "perhaps one may have a greater effect", "read just what people tell on this stuff:", "responding to a wave of popular support.", "some would say it is a long, hard", "spring right around the corner.", "strong behavior of the female ice dancer", "systems in their own backyards.", "temple was on the trading routes", "the effect sizes are shown in tables 2 and 3.", "the food may not live up to their european models.", "the issue came up in her suspension", "the return to b in the exposition.", "there are only a few days to live.", "those included costs associated with its power", "those were the first to experience it!", "tourist district, it is full of giant malls.", "we are committed to the concept of contract", "you into the ranks of tax payers"];

texts_formal = texts_formal.sort((a, b) => a.length - b.length);
texts_informal = texts_informal.sort((a, b) => a.length - b.length);

let sections = [
    [],
    [],
    []
];

const section_numbers = [0, 1, 2];

while (texts_informal.length >= section_numbers.length) {
    section_numbers.forEach(indx => {
        sections[indx].push([texts_informal.shift(), 'informal', indx + 1]);
        sections[indx].push([texts_formal.shift(), 'formal', indx + 1]);
    });
}
section_numbers.forEach(indx => {
    sections[indx] = shuffle(sections[indx]);
});
sections = shuffle(sections);
examples = [
    [
        ["never represented a majority of the council", "NA"],
        ["i didn’t know where i was gonna go.", "NA"]
    ]
];

sections = examples.concat(sections);

let subject_results = [
    'subject_id', 'section', 'trial', 'type', 'sect_code', 'original', 'entered', 'similarity', 'valid', 'keysdown', 'keysup'
].join("\t") + "\n";

let add_f = "";

function add_response(valid) {
    simil = (Math.round(similarity * 100) / 100).toFixed(2);
    subject_results += [
        subject_id, sctn, trial, testitem[1], testitem[2] + add_f, testitem[0], entered, simil, valid, keysdown.join("|"), keysup.join("|")
    ].join("\t") + "\n";
}

function slideclicked() {
    document.getElementById("effort_id").classList.remove("slider_hide_thumb");
    document.getElementById('endbutton').style.visibility = 'visible';
}

function similar_text(first, second, percent) {
    // Programming Classics: Implementing the World's Best Algorithms by Oliver (ISBN 0-131-00413-1)
    // https://www.php.net/manual/en/function.similar-text.php
    if (first === null || second === null || typeof first === 'undefined' || typeof second === 'undefined') {
        return 0;
    }

    first += '';
    second += '';

    var pos1 = 0,
        pos2 = 0,
        max = 0,
        firstLength = first.length,
        secondLength = second.length,
        p, q, l, sum;

    max = 0;

    for (p = 0; p < firstLength; p++) {
        for (q = 0; q < secondLength; q++) {
            for (l = 0;
                (p + l < firstLength) && (q + l < secondLength) && (first.charAt(p + l) === second.charAt(q + l)); l++)
            ;
            if (l > max) {
                max = l;
                pos1 = p;
                pos2 = q;
            }
        }
    }

    sum = max;

    if (sum) {
        if (pos1 && pos2) {
            sum += this.similar_text(first.substr(0, pos1), second.substr(0, pos2));
        }

        if ((pos1 + max < firstLength) && (pos2 + max < secondLength)) {
            sum += this.similar_text(first.substr(pos1 + max, firstLength - pos1 - max), second.substr(pos2 + max,
                secondLength - pos2 - max));
        }
    }

    if (!percent) {
        return sum;
    } else {
        return (sum * 200) / (firstLength + secondLength);
    }
}
