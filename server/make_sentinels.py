from imagecorruptions import get_corruption_names
import numpy as np
from imagecorruptions import corrupt
import osTools as ot
import random
from subprocess import call
from PIL import Image
import os

if __name__ == "__main__" : 
    input_folder = 'user_study_dataset/input'
    input_files = ot.listdir(input_folder)

    output_folder = 'sentinels/image_quality'

    rng = random.Random(0)
    
    corruption_names = get_corruption_names()
    corruption_names.remove('gaussian_noise')

    for i in range(10) : 

        corruption_name = rng.choice(corruption_names)
        input_file = rng.choice(input_files)

        input_pil = Image.open(input_file)
        output_pil = Image.fromarray(corrupt(np.array(input_pil), corruption_name=corruption_name, severity=5))

        os.makedirs(os.path.join(output_folder, 'original'), exist_ok=True)
        os.makedirs(os.path.join(output_folder, 'corrupt'), exist_ok=True)

        input_pil.save(os.path.join(output_folder, 'original', f'img_{i:03d}.png'))
        output_pil.save(os.path.join(output_folder, 'corrupt', f'img_{i:03d}.png'))
