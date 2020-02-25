# libs, funcs ----

library("neatStats")
library("data.table")


# COLLECT DATA ----

setwd(path_neat("kb_id/kb_id_results/"))
file_names = list.files(pattern = "^kb_id_.*txt$")

if ( exists("main_cit_merg") ) {
    rm(main_cit_merg)
}

for(f_name in file_names){
    #f_name = "kb_id_CEM_20200224154658.txt"

    print(f_name)

    subj_data = read.table(
        f_name,
        sep = "\t",
        header = TRUE,
        fill = TRUE,
        quote = "\"",
        stringsAsFactors = FALSE
    )

    dems_row = subj_data[startsWith(as.character(subj_data$subject_id), 'dems'),]
    dems_heads = strsplit(dems_row[[2]], "/")[[1]]
    dems_dat = strsplit(dems_row[[3]], "/")[[1]]
    dems = do.call(rbind.data.frame, list(dems_dat))
    colnames(dems) = dems_heads

    subj_data = subj_data[subj_data$section %in% c(1,2,3),]

    if (nrow(subj_data) != 60) { # just double-check
        print("number of rows:")
        print(nrow(subj_data))
        stop("trial num incorrect")
    }
    vald = sum(subj_data$similarity >= 90)
    if (sum(subj_data$valid == 1) != vald) {
        stop("val: ",
             sum(subj_data$valid == 1),
             " sim: ",
             vald)
    }
    dems["valid"] = vald

    ##

    splt <- strsplit(subj_data$keysup, '|', fixed = TRUE)

    dat_keyup = data.frame(subject_id = subj_data$subject_id[1],
                           section = rep(subj_data$section, lengths(splt)),
                           trial = rep(subj_data$trial, lengths(splt)),
                           type = rep(subj_data$type, lengths(splt)),
                           sect_code = rep(subj_data$sect_code, lengths(splt)),
                           keyups = unlist(splt))

    splitt <- do.call(rbind, strsplit(as.character(dat_keyup$keyups),'&',fixed = TRUE))
    colnames(splitt) <- c("key", "pkey", "keycode", "uptime" )
    dat_keyup$keyups <- NULL
    dat_keyup = data.frame(dat_keyup, splitt)

    splt <- strsplit(subj_data$keysdown, '|', fixed = TRUE)

    dat_keydown = data.frame(subject_id = subj_data$subject_id[1],
                           section = rep(subj_data$section, lengths(splt)),
                           trial = rep(subj_data$trial, lengths(splt)),
                           type = rep(subj_data$type, lengths(splt)),
                           sect_code = rep(subj_data$sect_code, lengths(splt)),
                           keydowns = unlist(splt))

    splitt <-
        do.call(rbind, strsplit(as.character(dat_keydown$keydowns), '&', fixed = TRUE))
    colnames(splitt) <- c("key", "pkey", "keycode", "downtime" )
    dat_keydown$keydowns <- NULL
    dat_keydown = data.frame(dat_keydown, splitt)

    keydat_merg = merge(dat_keydown, dat_keyup, all = TRUE)
    keydat_merg$downtime = as.numeric(as.character(keydat_merg$downtime))
    keydat_merg$uptime = as.numeric(as.character(keydat_merg$uptime))
    keydat_merg = keydat_merg[keydat_merg$downtime < keydat_merg$uptime,]
    keydt <- data.table(keydat_merg)
    keydt = keydt[ , .SD[which.min(uptime)], by = setdiff(names(keydt), "uptime")]
    multipledown = keydt[ , .SD[which.min(downtime)], by = setdiff(names(keydt), "downtime")]
    if (nrow(multipledown) != nrow(keydt)) {
        thediff = nrow(keydt) - nrow(multipledown)
        message("Note: multiple keydowns: ", thediff)
        keydt = multipledown
    }


    nrow(keydt)

    #

    if ( exists("main_cit_merg") ) { # add subject aggregations
        trials_merg =  merge( trials_merg, subject_trials, all = T)
        dems_merg = merge( dems_merg, dems, all = T)
    } else {
        trials_merg = subject_trials
        dems_merg = dems
    }
}

dems_neat()

