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

function no_cons() {
    document.getElementById('consent').style.display = 'none';
    document.getElementById('nocons_id').style.display = 'block';
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
        disp_start = now();
    } else {
        if (sctn < sections.length - 1) {
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
    words_ori = orig.match(/\b(\w+)\b/g).length;
    words_ent = entered.match(/\b(\w+)\b/g).length;
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

let type_start, disp_start, disp_end;
let listenkey = false;

function start_typing() {
    document.getElementById('memorize').style.display = 'none';
    disp_end = now();
    document.getElementById("input_id").value = "";
    setTimeout(() => {
        type_start = now();
        document.getElementById('typingdiv').style.display = 'block';
        document.getElementById("input_id").focus();
        listenkey = true;
    }, 100);
}

function listeners() {
    document.getElementById('input_id').addEventListener('keydown', function(e) {
        let time = now() - type_start;
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
        let time = now() - type_start;
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
    document.getElementById('fakedsect_id').textContent = ['first', 'second', 'third'][fakedsection - 1];
    let beginning = "Now starts the full test that consists of three sections. You will receive instructions before each section separately.<br><br>";
    let fakeit = "<b>please try to fake your way of typing</b>. It is up to you how you do this. This represents a situation in which you try to hide your identity while typing (e.g. because you are doing something illegal on the computer). Imagine that the keystroke behavior could be used to determine whether it is you who writes these texts. Therefore, you want to type differently from how you normally would.";
    window.blocktexts = ["<b>please type just as you normally would</b>.", "<b>again please type just as you normally would</b>."];
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
    return (window.matchMedia("only screen and (max-width: 590px)").matches || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
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

let texts_informal = ["his thoughts were not of the future, but my own past.", "i always knew you were a poor captain, but a *captain*", "i don’t know how it is that wrinkles don't hurt.", "i know some of you want to do because you want it.", "i wondered why, if he had to knock up the archbishop", "if i am not, i had the opportunity to renovate it", "in fact, i've never felt so appraised in all my life.", "it took shape; it was a debate before the students", "it was dark enough that i could feel a slight itching.", "it's good to see you!! i hope you're here to see her.", "not remember any of this amounts to anything.", "now she seemed to have the man turned over to her.", "now, that, fame, is for me to measure up to you.", "salvation and a place where you gave up thinking.", "swore, if i ever had the pleasure of doing that myself!", "teach him how to fish, and he will eat for a day.", "that your passing adds a sense of honor, and decency",
    "the effect is the sort of romance that sustains", "the stake went down, there was a mix-up in the lab", "these languages, the number of active terrorists.", "turning a corner of the building on the sixth floor."
]; // 1062 characters, 219 words

let texts_formal = ["a large group of scientists from developing regions.", "and explaining how humans are the major cause", "compares left and right chemical seed detectors.", "his computer but that the company should not mind me.", "i write to inform you that your profile is accurate.", "if you cannot find a lady, who would be classified", "in defense of the other groups to that of our parents’", "in order to meet the needs of the nation's mail users.", "interventions for older adults who would be good to get", "knowing what is best for a computer to use the word.", "measure due to the location of two official parks", "member, the success of the independent film industry.", "mercury emissions contribute to ground-level ozone", "objective was to make the experimental program", "president for programs to ask for community support", "struggles last year and i wanted to be there…", "the final book of the new territories’ walled villages.",
    "the food may not live up to their european models.", "there are two sets of equatorial ligands for species v", "therefore face all of the information it contains.", "your contribution will help us begin organizing"
]; // 1065 characters, 181 words

// (1062+1065)/3 = 709; ca. 700 chars per section

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
        ["i am ready for the last day of swimming class", "NA", 0],
        ["bring binoculars for the annual maiden’s festival.", "NA", 0]
    ]
];

sections = examples.concat(sections);

let subject_results = [
    'subject_id', 'section', 'trial', 'type', 'sect_code', 'original', 'entered', 'similarity', 'valid', 'display_start', 'display_end', 'type_start', 'keysdown', 'keysup'
].join("\t") + "\n";

let add_f = "";

function add_response(valid) {
    simil = (Math.round(similarity * 100) / 100).toFixed(2);
    subject_results += [
        subject_id, sctn, trial, testitem[1], testitem[2] + add_f, testitem[0], entered, simil, valid, Math.round(disp_start * 1000), Math.round(disp_end * 1000), Math.round(type_start * 1000), keysdown.join("|"), keysup.join("|")
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
