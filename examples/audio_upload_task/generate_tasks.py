import csv
import json

def main():

    filename = '/private/home/padentomasello/data/alarm_train.tsv'
    tasks = {}
    with open(filename, 'r') as f:
        rd = csv.reader(f, delimiter="\t")
        for (idx, row) in enumerate(rd):
            if (idx == 0): continue
            (domain, utterance, parse) = row
            key = hash(tuple(row))
            tasks[key] = utterance
            if(idx == 10): break
    with open("/private/home/padentomasello/data/alarm_train_tasks.json", "w") as o:
        json.dump(tasks, o, indent=4)

if __name__ == "__main__":
    main()
