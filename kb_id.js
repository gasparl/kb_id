/*jshint esversion: 6 */
let end_url = "https://www.prolific.co/";
document.addEventListener("DOMContentLoaded", function() {
    if (mobile()) {
        alert(
            "You seem to be using a smartphone or tablet. \nUnfortunately you cannot do this experiment on a mobile device. \nPlease start the experiment again with a normal webbrowser on your computer."
        );
        window.location = end_url;
    }
    document.getElementById('feedback').style.display = 'block'; // default: consent feedback
    listeners();
    let start = Date.now();
});

function consented() {
    document.getElementById('consent').style.display = 'none';
    document.getElementById('demographics').style.display = 'block';
    window.consent_now = Date.now();
}

function to_intro() {
    document.getElementById('demographics').style.display = 'none';
    document.getElementById('intro').style.display = 'block';
    window.consent_now = Date.now();
}

let sctn = 0;
let trial = 0;

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
        if (sctn < 4) {
            sctn++;
            trial = 0;
            document.getElementById('newsection').style.display = 'block';
        } else {
            document.getElementById('end_id').style.display = 'block';
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
        feed.push("The sentence you wrote seems completely different from the original sentence. Please memorize and enter the sentences properly.");
    } else if (similarity < 50) {
        feed.push("The sentence you wrote seems very different from the original sentence. Please memorize and enter the sentences properly.");
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
        let key;
        if (listenkey) {
            if (e.code === "Space") {
                key = "Space";
            } else {
                key = e.key;
            }
        }
        keysdown.push(key);
    });
    document.getElementById('input_id').addEventListener('keyup', function(e) {
        let time = now() - start;
        let key;
        if (listenkey) {
            if (e.code === "Space") {
                key = "Space";
            } else {
                key = e.key;
            }
        }
        keysup.push(key);
    });

    document.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            if (document.getElementById('memorize').style.display === 'block') {
                start_typing();
            } else if (document.getElementById('typingdiv').style.display === 'block') {
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


function ending() {
    var duration_full = Math.round((Date.now() - consent_now) / 600) / 100;
    ratings += 'dems\t' + [
            'subject_id',
            'fakedsection',
            'gender',
            'age',
            'browser_name',
            'browser_version',
            'full_dur'
        ].join('/') +
        '\t' + [
            subject_id,
            fakedsection,
            $('input[name=gender]:checked').val(),
            $("#age").val(),
            browser[0],
            browser[1],
            duration_full
        ].join('/');
    window.f_name =
        'kb_id_' +
        subject_id +
        "_" +
        fakedsection +
        ".txt";
    upload();
}

function upload() {
    window.f_name = "";
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
        })
        .catch((error) => {
            console.log('Request failed', error);
        });
}

function dl_as_file() {
    var blobx = new Blob([ratings], {
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

let texts_lowfreq = ["The cat stretched", "Jacob stood on his tiptoes", "The car turned the corner", "Kelly twirled in circles", "She opened the door", "Aaron made a picture", "I rinsed and dried the dishes", "The decline of this country has already started"];

let texts_highfreq = ["Joe stood up and spoke to the crowd", "The staff performed well", "A white shirt always looks sharp", "The pen is mightier than the sword", "Alice everyday goes to library to study", "The cat and the dog yowled and howled", "He was eating and talking", "The dog barked and ran"];

let sections = [
    [],
    [],
    [],
    []
];
while (texts_lowfreq.length >= 4) {
    [0, 1, 2, 3].forEach(indx => {
        sections[indx].push([texts_lowfreq.shift(), 'low']);
        sections[indx].push([texts_highfreq.shift(), 'high']);
    });
}
[0, 1, 2, 3].forEach(indx => {
    sections[indx] = shuffle(sections[indx]);
});
examples = [
    [
        ["first example sentence (placeholder)", "NA"],
        ["second example sentence (placeholder)", "NA"]
    ]
];

sections = examples.concat(sections);

let subject_results = [
    'subject_id', 'section', 'trial', 'freq', 'original', 'entered', 'similarity', 'valid', 'keysup', 'keysdown'
].join("\t") + "\n";

function add_response(valid) {
    simil = (Math.round(similarity * 100) / 100).toFixed(2);
    subject_results += [
        subject_id, sctn, trial, testitem[1], testitem[0], entered, simil, valid, keysup.join("|"), keysdown.join("|")
    ].join("\t") + "\n";
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
