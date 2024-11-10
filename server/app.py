import os
from copy import deepcopy
import pandas as pd
from subprocess import call
import os.path as osp
from flask import Flask, jsonify, request, session, make_response
from flask_session import Session
import pickle
import requests
import uuid
import json
from functools import partial
import random
import osTools as ot
import base64
from lxml import etree as ET

def rootdir():  
    return osp.abspath(osp.dirname(__file__))

# Setup application.
app = Flask(__name__, static_url_path='', static_folder='../client/build')
SESSION_TYPE = 'filesystem'
app.config.from_object(__name__)
Session(app)

# Important globals.
DATASET = 'examples'
ANNO_BASE = './data/'

with open('template_ab.svg', 'r') as f:
    SVG_CONTENT_AB = f.read()

with open('template_ref_ab.svg', 'r') as f:
    SVG_CONTENT_REF_AB = f.read()

TASK_TYPES = [
    dict(
        type='image_quality', 
        layout=SVG_CONTENT_AB, 
        sentinel_df=pd.read_csv('sentinel_image_quality.csv'),
        user_study_df=pd.read_csv('user_study_image_quality.csv')
    ), 
    dict(
        type='image_lighting', 
        layout=SVG_CONTENT_REF_AB, 
        sentinel_df=pd.read_csv('sentinel_image_lighting.csv'),
        user_study_df=pd.read_csv('user_study_image_lighting.csv')
    ), 
    dict(
        type='image_identity', 
        layout=SVG_CONTENT_REF_AB, 
        sentinel_df=pd.read_csv('sentinel_image_identity.csv'),
        user_study_df=pd.read_csv('user_study_image_identity.csv')
    ), 
]


rng = random.Random(0)

def apply_images_to_svg (svg_txt, image_mapping) : 
    encoded_images = {}
    for class_name, image_file in image_mapping.items():
        with open(image_file, 'rb') as img_file:
            encoded_string = base64.b64encode(img_file.read()).decode('utf-8')
        encoded_images[class_name] = encoded_string

    # Namespaces
    namespaces = {
        'svg': 'http://www.w3.org/2000/svg',
        'xlink': 'http://www.w3.org/1999/xlink'
    }

    # Parse SVG
    parser = ET.XMLParser(ns_clean=True)
    tree = ET.fromstring(svg_txt.encode('utf-8'), parser)

    for class_name, base64_data in encoded_images.items():
        # Find the rectangle with the given class
        rects = tree.xpath(".//svg:rect[@class='{}']".format(class_name), namespaces=namespaces)
        if rects:
            rect = rects[0]
            x = rect.get('x')
            y = rect.get('y')
            width = rect.get('width')
            height = rect.get('height')

            # Create new image element
            image_elem = ET.Element('{http://www.w3.org/2000/svg}image', {
                'x': x,
                'y': y,
                'width': width,
                'height': height,
                '{http://www.w3.org/1999/xlink}href': f'data:image/png;base64,{base64_data}',
                'class': class_name
            })

            # Replace rectangle with image
            parent = rect.getparent()
            parent.replace(rect, image_elem)
        else:
            print(f"No rectangle with class '{class_name}' found in SVG.")

    new_svg = ET.tostring(tree, pretty_print=True, encoding='utf-8').decode('utf-8')
    return new_svg

@app.route('/')
def root():  
    session['id'] = uuid.uuid4()
    N = 9
    session['tasks'] = []
    for task_type in TASK_TYPES : 
        sentinel_task = dict(task_type['sentinel_df'].sample(1).iloc[0])

        sentinel_task['kind'] = 'sentinel'
        sentinel_task['type'] = task_type['type'] 
        sentinel_task['layout'] = task_type['layout']

        session['tasks'].append(sentinel_task)

        general_tasks = task_type['user_study_df'].sample(N)

        for i in range(len(general_tasks)) : 
            general_task = dict(general_tasks.iloc[i])
            general_task['kind'] = 'user_study'
            general_task['type'] = task_type['type'] 
            general_task['layout'] = task_type['layout'] 
            session['tasks'].append(general_task)

    os.makedirs(f'{ANNO_BASE}/{session["id"]}', exist_ok=True) 
    with open(f'{ANNO_BASE}/{session["id"]}/tasks.json', 'w+') as fp : 
        json.dump(session['tasks'], fp) 

    with open(f'{app.static_folder}/index.html') as fp :
        content = fp.read()

    resp = make_response(content)
    return resp

@app.route('/task', methods=['POST', 'GET']) 
def task () : 
    taskNum = request.json['taskNum']
    task_data = deepcopy(session['tasks'][taskNum] )

    layout = task_data.pop('layout')
    keys = list(task_data.keys())
    for k in keys : 
        if k not in ['A', 'B', 'ref'] :
            task_data.pop(k) 

    new_svg = apply_images_to_svg(layout, task_data)
    type = session['tasks'][taskNum]['type']
    kind = session['tasks'][taskNum]['kind'] 

    return jsonify(svg=new_svg, type=type, kind=kind)

@app.route('/save', methods=['POST', 'GET']) 
def save () :
    taskNum = request.json['taskNum']
    choice = request.json['choice']
    with open(f'{ANNO_BASE}/{session["id"]}/responses.csv', 'a+') as fp : 
        fp.write(f'{taskNum},{choice}\n')
    return jsonify(success=True)

@app.route('/tutorialgraphic', methods=['POST', 'GET'])
def tutorialgraphic () :
    files = ot.listdir('tutorial')
    image_mapping = dict()
    for file in files :
        image_mapping[ot.getBaseName(file)] = file

    new_svg = apply_images_to_svg(image_mapping)

    return jsonify(svg=new_svg)

@app.route('/survey', methods=['POST', 'GET']) 
def survey () :
    id = session['id']
    ratings = request.json
    with open(f'{ANNO_BASE}/{id}/survey.txt', 'w+') as fp :
        for i, r in enumerate(ratings) :
            fp.write(f'{i}, {r}\n')
    return jsonify(success=True)

@app.route('/time', methods=['POST', 'GET'])
def time () : 
    id = session['id'] 
    payload = request.json
    if payload.get('start', False) :
        with open(f'{ANNO_BASE}/{id}/startTime.json', 'w+') as fp: 
            json.dump(payload, fp)
    elif payload.get('end', False) : 
        with open(f'{ANNO_BASE}/{id}/endTime.json', 'w+') as fp :
            json.dump(payload, fp)
    elif payload.get('slideId', None) is not None : 
        with open(f'{ANNO_BASE}/{id}/slideTime.json', 'a+') as fp: 
            fp.write(json.dumps(payload) + '\n')
    return jsonify(success=True)

@app.route('/comments', methods=['POST', 'GET'])
def comments () : 
    id = session['id']
    comments = request.json['comments']
    with open(f'{ANNO_BASE}/{id}/comments.txt', 'w+') as fp :
        fp.write(comments + '\n') 
    cid = str(uuid.uuid4())[:6]
    with open(f'{ANNO_BASE}/{id}/cid.txt', 'w+') as fp :
        fp.write(cid + '\n')
    return jsonify(cid=cid, success=True)

@app.route('/validate', methods=['POST', 'GET'])
def validate () :
    email = request.json['email']
    id = session['id']
    with open(f'{ANNO_BASE}/{id}/email.txt', 'w+') as fp :
        fp.write(email)
    return jsonify(success=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

