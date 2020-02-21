#%% import stuff

import markovify
import os
import random
import pyperclip

basepath = "C:/research/proj_key_dynamics/masc_500k_texts/written/"

#%% declare functions

# data source: http://www.anc.org/data/masc/
def get_model(path):
    path = basepath + "/" + path
    combined_model = None
    for (dirpath, _, filenames) in os.walk(path):
        for filename in filenames:
            print(os.path.join(dirpath, filename))
            with open(os.path.join(dirpath, filename), encoding="utf-8", errors='ignore') as f:
                model = markovify.Text(f, state_size=3)
                if combined_model:
                    combined_model = markovify.combine(models=[combined_model, model])
                else:
                    combined_model = model
    return combined_model

def gen_text(markov_model, num = 10, typ = "x"):
    sentences = ""
    # length\tgenerated_text\tgen_text_lower\ttype\n"
    for _ in range(num):
        new_s = markov_model.make_short_sentence(55, 40, tries = 50)
        print(len(new_s), new_s)
        sentences += str(len(new_s)) + "\t" +  new_s + "\t" +  new_s.lower() + "\t" +  typ + "\n"
    pyperclip.copy(sentences)

#%% read texts to create models
random.seed(1)

formals = get_model("formal-technical")
informals = get_model("informal-natural")

#%% generate sentences
random.seed(1)

gen_text(formals, 100, "formal")

gen_text(informals, 100, "informal")


