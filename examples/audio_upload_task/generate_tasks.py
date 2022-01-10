import csv
import json
import hashlib
import hashlib
import re

def hash_helper(tup):
    return hashlib.md5(str(tup).encode()).hexdigest()[:8]
    


def main():

    # a_re = re.compile('(\d)(a)( |.)')
    a_re = re.compile('(\d)(a)( |\.$|, )')
    p_re = re.compile('(\d| )(p)( |\.$|$|,)')
    # p_re = re.compile('(\d)(p)( |.)')
    f_re = re.compile('(\d| )(f|F)( |\.$|$)')
    c_re = re.compile('(\d| )(c|C)( |\.$|$)')


    split = 'weather_train'
    filename = '/private/home/padentomasello/data/topv2_original_from_local/' + split +'.tsv'
    tasks = {}
    idx_mapping = {}
    duplicates = 0
    with open(filename, 'r') as f:
        rd = csv.reader(f, delimiter="\t")
        for (idx, row) in enumerate(rd):
            if (idx == 0): continue
            (domain, utterance, parse) = row
            m = f_re.search(utterance)
            if(m):
                print('Old', utterance)
                utterance = f_re.sub(r'\1fahrenheit\3', utterance)
                print('New', utterance)
            m = c_re.search(utterance)
            if(m):
                print('Old', utterance)
                utterance = c_re.sub(r'\1celcius\3', utterance)
                print('New', utterance)
            m = p_re.search(utterance)
            if(m):
                print('Old', utterance)
                utterance = p_re.sub(r'\1PM\3', utterance)
                print('New', utterance)
            m = a_re.search(utterance)
            if(m):
                print('Old', utterance)
                utterance = a_re.sub(r'\1AM\3', utterance)
                print('New', utterance)
            # I KNOW THIS IS AWFUL
            key = hash_helper([domain, utterance, parse])
            if(key in tasks):
                duplicates += 1
                print('duplicates', duplicates)
            filename = "{:08d}".format(idx)
            idx_mapping[key] = filename
            tasks[filename] = [domain, utterance, parse]
    # with open("/private/home/padentomasello/data/mephisto/alarm_test_idx_map.json", "w") as o:
        # json.dump(idx_mapping, o, indent=4)
    with open("/private/home/padentomasello/data/mephisto/" + split + ".json", "w") as o:
        json.dump(tasks, o, indent=4)

if __name__ == "__main__":
    main()
