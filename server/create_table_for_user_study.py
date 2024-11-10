import pandas as pd
import random
import osTools as ot
import os 
import os.path as osp

rng = random.Random(0)
N = 2000
OTHER_FOLDERS = [
    'user_study_dataset/neural_gaffer', 
    'user_study_dataset/iclight', 
    'user_study_dataset/switchlight'
]

def create_df_for_ref_ab (ref_folder) : 
    our_folder = 'user_study_dataset/ours'
    data = dict(A=[], B=[], ref=[])
    data_cnt = 0
    while True :
        our_file = random.choice(ot.listdir(our_folder))
        other_file = osp.join(rng.choice(OTHER_FOLDERS), osp.basename(our_file))
        ref_file = osp.join(ref_folder, osp.basename(our_file))

        if osp.exists(other_file) and osp.exists(ref_file): 
            choices = ['A', 'B']
            rng.shuffle(choices)
            kour, kother = choices

            data[kour].append(our_file)
            data[kother].append(other_file)
            data['ref'].append(ref_file)
            
            data_cnt += 1


        if data_cnt == N : 
            break

    return pd.DataFrame(data)

def create_df_for_ab () : 
    our_folder = 'user_study_dataset/ours'
    data = dict(A=[], B=[])
    data_cnt = 0
    while True :
        our_file = random.choice(ot.listdir(our_folder))
        other_file = osp.join(rng.choice(OTHER_FOLDERS), osp.basename(our_file))

        if osp.exists(other_file): 
            choices = ['A', 'B']
            rng.shuffle(choices)
            kour, kother = choices

            data[kour].append(our_file)
            data[kother].append(other_file)
            
            data_cnt += 1

        if data_cnt == N : 
            break

    return pd.DataFrame(data)

if __name__ == "__main__" : 
    create_df_for_ref_ab('user_study_dataset/ref').to_csv('user_study_image_lighting.csv', index=False) 
    create_df_for_ref_ab('user_study_dataset/input').to_csv('user_study_image_identity.csv', index=False) 
    create_df_for_ab().to_csv('user_study_image_quality.csv', index=False)
