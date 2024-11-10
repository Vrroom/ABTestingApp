import os
import os.path as osp
import osTools as ot
import json
from collections import defaultdict

baseline_methods = ['iclight', 'switchlight', 'neural_gaffer']
our_method = 'ours'
task_types = ['image_quality', 'image_lighting', 'image_identity'] 

def get_results_from_response (dirname) :
    with open(osp.join(dirname, 'tasks.json')) as fp :
        tasks = json.load(fp)

    with open(osp.join(dirname, 'responses.csv')) as fp : 
        responses = fp.readlines()
        responses = [_.strip().split(',') for _ in responses]
        responses = dict([(int(a.strip()), b.strip()) for a,b in responses])

    data = defaultdict(lambda : dict())
    
    for task_type in task_types : 
        resp_for_type = [(i, _) for i, _ in enumerate(tasks) if _['type'] == task_type]
        sentinel = [(i, r) for i, r in resp_for_type if r['kind'] == 'sentinel'] 

        sentinel_correct = False
        if len(sentinel) == 1 : 
            idx, resp = sentinel[0]
            sentinel_correct = resp[responses[idx]] == resp['correct']

        data[task_type]['sentinel_correct'] = sentinel_correct 

        user_study_resps = [(i, r) for i, r in resp_for_type if r['kind'] == 'user_study']

        for idx, resp in user_study_resps : 

            choices = ["A", "B"] 
            our_tag = "A" if resp["A"].split('/')[1] == our_method else "B" 

            choices.remove(our_tag)
            other_tag = choices[0]
            other_method_name = resp[other_tag].split('/')[1]

            chosen = responses[idx]
            if (our_method, other_method_name) in data[task_type] : 
                data[task_type][(our_method, other_method_name)].append(chosen == our_tag)
            else : 
                data[task_type][(our_method, other_method_name)] = [chosen == our_tag]
    return data

def aggregate_responses (data_dir) : 
    datas = [] 
    for folder in ot.listdir('data') : 
        datas.append(get_results_from_response(folder))

    all_responses = defaultdict(lambda : []) 

    for task_type in task_types : 
        for data in datas : 
            if data[task_type]['sentinel_correct'] : 
                for k in data[task_type].keys() : 
                    if isinstance(k, tuple) : 
                        all_responses[(task_type, *k)].extend(data[task_type][k])

    for k in all_responses.keys()  :
        print(k)
        print(sum(all_responses[k]) / len(all_responses[k]))

if __name__ == "__main__" : 
    aggregate_responses('data')

