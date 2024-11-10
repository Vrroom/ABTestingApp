import pandas as pd
import random
import osTools as ot
import os 
import os.path as osp

rng = random.Random(0)

if __name__ == "__main__" : 
    folder = 'sentinels/image_lighting'
    data = dict(A=[], B=[], ref=[], correct=[]) 
    base_name = osp.basename(folder)
    csv_name = f'sentinel_{base_name}.csv' 
    
    ref = ot.listdir(osp.join(folder,'ref'))
    correct = ot.listdir(osp.join(folder,'correct'))
    incorrect = ot.listdir(osp.join(folder,'incorrect'))

    for r, c, i in zip(ref, correct, incorrect) : 
        choices = ['A', 'B']
        rng.shuffle(choices)
        kc, ki = choices

        data[kc].append(c)
        data[ki].append(i)
        data['ref'].append(r)
        data['correct'].append(c)

    pd.DataFrame(data).to_csv(csv_name, index=False)

    folder = 'sentinels/image_identity'
    data = dict(A=[], B=[], ref=[], correct=[]) 
    base_name = osp.basename(folder)
    csv_name = f'sentinel_{base_name}.csv' 
    
    ref = ot.listdir(osp.join(folder,'ref'))
    correct = ot.listdir(osp.join(folder,'correct'))
    incorrect = ot.listdir(osp.join(folder,'incorrect'))

    for r, c, i in zip(ref, correct, incorrect) : 
        choices = ['A', 'B']
        rng.shuffle(choices)
        kc, ki = choices

        data[kc].append(c)
        data[ki].append(i)
        data['ref'].append(r)
        data['correct'].append(c)

    pd.DataFrame(data).to_csv(csv_name, index=False)

    folder = 'sentinels/image_quality'
    data = dict(A=[], B=[], correct=[]) 
    base_name = osp.basename(folder)
    csv_name = f'sentinel_{base_name}.csv' 
    
    correct = ot.listdir(osp.join(folder,'correct'))
    incorrect = ot.listdir(osp.join(folder,'incorrect'))

    for  c, i in zip(correct, incorrect) : 
        choices = ['A', 'B']
        rng.shuffle(choices)
        kc, ki = choices

        data[kc].append(c)
        data[ki].append(i)
        data['correct'].append(c)

    pd.DataFrame(data).to_csv(csv_name, index=False)
