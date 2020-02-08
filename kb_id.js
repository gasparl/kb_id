/*jshint esversion: 6 */

let start = Date.now();
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('consent').style.display = 'block';

    document.getElementById('input_id').addEventListener('keydown', function(e) {
        let time = Date.now() - start;
        let key;
        if (e.code === "Space") {
            key = "Space";
        } else {
            key = e.key;
        }
        document.getElementById('keydowns_id').textContent += " " + key;
        document.getElementById('keydownsms_id').textContent += " " + key + "[" + time + "]";
    });
    document.getElementById('input_id').addEventListener('keyup', function(e) {
        let time = Date.now() - start;
        let key;
        if (e.code === "Space") {
            key = "Space";
        } else {
            key = e.key;
        }
        document.getElementById('keyups_id').textContent += " " + key;
        document.getElementById('keyupsms_id').textContent += " " + key + "[" + time + "]";
    });

});


function consented() {
    document.getElementById('consent').style.display = 'none';
    document.getElementById('demographics').style.display = 'block';
    window.consent_now = Date.now();
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
    fetch('https://homepage.univie.ac.at/gaspar.lukacs/kb_id/kb_id.php', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            },
            body: JSON.stringify({
                fname_post: "xx_20200205171353_KAN.txt",
                results_post: "results bla".repeat(99)
            })
        })
        .then(response => response.text())
        .then(data => {
            console.log(data);
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
