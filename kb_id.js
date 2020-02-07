/*jshint esversion: 6 */

var experiment_title = 'silhu_univie';

$(document).ready(() => {
    let dropChoices = '';
    countrs.forEach((word) => {
        dropChoices += '<option value="' + word + '">' + word + '</option>';
    });
    $("#country").append(dropChoices);
    $('#consent').show(); // default: consent
    if (aro_or_val == 'arousal') {
        $('#valencefull_id').hide();
    } else if (aro_or_val == 'valence') {
        $('#arousalfull_id').hide();
    }
    getexamplepics();
    getmainpics();
    starter();
});

function consented() {
    $("#consent").hide();
    $("#demographics").show();
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

var bw_or_wb = rchoice(['_bw', '_wb']);
var aro_or_val = rchoice(['arousal', 'valence', 'both']);

var piclists = shuffle([
    ["aircraft", "accident", "amusementpark", "affection2", "accident2", "ache", "ache2", "ache3", "acrobat", "acrobat2", "acrobat3", "aerobics", "affection", "affection3", "agreement", "aircraft2", "airplane", "airplane2", "airplane3", "ambulance"],
    ["amusementpark2", "analyse", "anger", "ant", "ant2", "apology", "argument", "argument2", "argument3", "argument4", "argument5", "argument6", "argument7", "armchair", "army", "attack", "axe", "axe2", "axe3"]
]);

function getexamplepics() {
    let example_pics = piclists[piclists.length - 1].splice(0, 4);
    window.first_pic = example_pics.shift();
    example_pics = example_pics.map((pict) => {
        return (pict + bw_or_wb + '.png');
    });
    var example_imgs = {};
    example_pics.forEach((filename, ind) => {
        example_imgs[filename] = new Image();
        example_imgs[filename].onload = () => {
            document.getElementById("example" + (ind + 1) + '_id').src = example_imgs[filename].src;
        };
        example_imgs[filename].src = 'pics/' + filename;
    });
}


function getmainpics() {
    window.main_pics = piclists.shift();
    main_pics = shuffle(main_pics);
    main_pics = [first_pic].concat(main_pics);
    main_pics.push('0car');
    main_pics = main_pics.map((pict) => {
        return (pict + bw_or_wb + '.png');
    });
    getpicset();
}

function getpicset() {
    $(".load_screen").show();
    $(".start_button").hide();
    // preload
    var promises = [];
    window.images = {};
    for (var i = 0; i < main_pics.length; i++) {
        ((filename, promise) => {
            images[filename] = new Image();
            images[filename].id = filename;
            images[filename].onload = () => {
                promise.resolve();
            };
            images[filename].src = 'pics/' + filename;
        })(main_pics[i], promises[i] = $.Deferred());
    }
    $.when.apply($, promises).done(() => {
        console.log("All images ready!");
        $(".load_screen").hide();
        $(".start_button").show();
    });
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


function starttask() {
    $("#intro").hide();
    $("#intermission").hide();
    $("#rating").show();
    next_pic_rate();
}


var trial = -1;

function next_pic_rate() {
    if (main_pics.length !== 0) {
        $('#rating_actual').hide();
        $('#submit_button').hide();
        $('#stimulus_rate').show();
        window.trial_stim = main_pics.shift();
        trial += 1;
        console.log('Current Trial:', trial);
        image_display_rate();
    } else {
        $("#rating").hide();
        ending();
        $("#Bye").show();
    }
}

function ending() {
    var duration_full = Math.round((Date.now() - consent_now) / 600) / 100;
    ratings += 'dems\t' + [
            'subject_id',
            'bw_or_wb',
            'rating_type',
            'gender',
            'age',
            'country',
            'browser_name',
            'browser_version',
            'attention',
            'full_dur'
        ].join('/') +
        '\t' + [
            subject_id,
            bw_or_wb.slice(1),
            aro_or_val,
            $('input[name=gender]:checked').val(),
            $("#age").val(),
            $("#country").val(),
            browser[0],
            browser[1],
            $('input[name=acheck]:checked').val(),
            duration_full
        ].join('/');
    window.f_name =
        experiment_title +
        bw_or_wb +
        "_" +
        subject_id +
        ".txt";
    upload();
}

function upload() {
    $.post(
            "store_finish.php", {
                filename_post: f_name,
                results_post: ratings
            },
            function(resp) {
                console.log(resp);
                if (resp.startsWith("Fail")) {
                    $('#div_end_error').show();
                } else {
                    $('#scs_id').show();
                }
            }
        )
        .fail(function(xhr, status, error) {
            console.log(xhr);
            console.log(error);
            $('#div_end_error').show();
            // $("#passw_display").html("<i>(server connection failed)</i>");
        });
}

function save_demo() {
    $("#demographics").hide();
    $("#intro").show();
    //next_pic_rate();
}

var resp_valence, resp_arousal, resp_clarity;

function reset_scales() {
    resp_valence = 'NA';
    resp_arousal = 'NA';
    resp_clarity = 'NA';
    $(".slider").addClass("slider_hide_thumb");
    if (aro_or_val == 'arousal') {
        resp_valence = '-';
        $("#valence_id").removeClass("slider_hide_thumb");
    } else if (aro_or_val == 'valence') {
        resp_arousal = '-';
        $("#arousal_id").removeClass("slider_hide_thumb");
    }
    $("#display_v, #display_a, #display_c").text("");
}

function starter() {
    reset_scales();
    // VALENCE RATING SCALE
    $("#valence_id").on("click", () => {
        resp_valence = $("#valence_id").val();
        $("#display_v").text(resp_valence);
        $("#valence_id").removeClass("slider_hide_thumb");
        if (!$(".slider").hasClass("slider_hide_thumb")) {
            $('#submit_button').show();
        }
    });
    // AROUSAL RATING SCALE
    $("#arousal_id").on("click", () => {
        resp_arousal = $("#arousal_id").val();
        $("#display_a").text(resp_arousal);
        $("#arousal_id").removeClass("slider_hide_thumb");
        if (!$(".slider").hasClass("slider_hide_thumb")) {
            $('#submit_button').show();
        }
    });
    // CLARITY RATING SCALE
    $("#clarity_id").on("click", () => {
        resp_clarity = $("#clarity_id").val();
        $("#display_c").text(resp_clarity);
        $("#clarity_id").removeClass("slider_hide_thumb");
        if (!$(".slider").hasClass("slider_hide_thumb")) {
            $('#submit_button').show();
        }
    });
    // submit and next
    $("#submit_button").on("click", () => {
        console.log('SUBMIT');
        save_response();
    });
    window.canvas = document.getElementById('rate_canvas');
    window.ctx = canvas.getContext('2d');
}

var ratings = [
    "subject_id", "trial_number", "pic", "valence", "arousal", "clarity"
].join("\t") + '\n';

var rated = {};

function save_response() {
    ratings += [
        subject_id, trial, trial_stim, resp_valence, resp_arousal, resp_clarity
    ].join("\t") + "\n";
    console.log('trial: ' + trial, 'stim: ' + trial_stim, 'resp_valence: ' + resp_valence, 'resp_arousal: ' + resp_arousal, 'resp_clarity: ' + resp_clarity);
    if (trial > 0 && resp_valence !== 'NA' && resp_arousal !== 'NA') {
        rated[trial_stim] = [resp_valence, resp_arousal];
    }
    reset_scales();
    next_pic_rate();
}

var extr_num = 5;

function extremes() {
    if (aro_or_val === 'arousal') {
        all_keys = Object.keys(rated).sort((a, b) => {
            return rated[a][1] - rated[b][1];
        });
    } else {
        all_keys = Object.keys(rated).sort((a, b) => {
            return rated[a][0] - rated[b][0];
        });
    }
    let lowest = all_keys.slice(0, extr_num);
    let highest = all_keys.slice(all_keys.length - extr_num);
    main_pics = shuffle(lowest.concat(highest));
    if (main_pics.length !== (extr_num * 2)) {
        console.log('not enough valid: ', main_pics.length);
        main_pics = shuffle(Object.keys(rated)).slice(0, (extr_num * 2));
    }
    getpicset();
}

function image_display_rate() {
    var img = images[trial_stim];
    ctx.drawImage(img, 0, 0);
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        $('#stimulus_rate').hide();
        setTimeout(() => {
            if (trial_stim[0] === '0') {
                trial = 9000;
                extremes();
                $('#attention_check').show();
            } else {
                $('#rating_actual').show();
            }
        }, 500);
    }, 2000);
}

function skip() {
    reset_scales();
    $('#submit_button').show();
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

browser = (function() {
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

var countrs = ["Austria", "Germany", "Switzerland", "Italy", "Hungary", "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea Bissau", "Guyana", "Haiti", "Vatican City", "Honduras", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea ", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea ", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];
