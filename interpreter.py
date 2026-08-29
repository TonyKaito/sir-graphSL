import json
import copy
import random
import pyray as pr

def read_file(path):
    with open(path, 'r') as f:
        file = json.load(f)
    
    return file


def createNodes(gameData, node_list):
    gameData["nd_count"] = len(node_list)
    
    gameData["nd_id"] = list(range(0, len(node_list)))
    
    gameData["nd_name"] = copy.deepcopy(node_list)
    
    gameData["nd_pos"] = [0] * len(node_list)
    gameData["nd_pos"] = list(map(lambda x : pr.Vector2(100 * random.randint(0, 8), 100 * random.randint(0, 6)), gameData["nd_pos"]))
    
    gameData["nd_rad"] = [32] * len(node_list)
    
    # print(gameData)
    return
    
def createConns(gameData, con_list):
    gameData["con_count"] = len(con_list)
    
    gameData["con_id"] = list(range(0, len(con_list)))
    
    names = list(map(lambda x : x["name"], con_list))
    gameData["con_name"] = names
    
    vertices = list(map(lambda x : x["vertices"], con_list))
    gameData["con_points"] = vertices
    
    gameData["box_side_dim"] = [(50, 100)] * len(con_list)
    
    # print (gameData)
    return

def doSmth():
    gameData = {
        "nd_count": 0,
        "nd_id": [],
        "nd_name": [],
        "nd_pos": [],
        "nd_rad": [],
    #    "nd_type": [],
    #    "nd_tags": [],
    
        "con_count": 0,
        "con_id": [],
        "con_name": [],
        "con_points": [],
        "box_side_dim": [],
    
        "selected_id": -1,
    }
    thing = read_file("./result.json")    
    createNodes(gameData, thing[1]["circ"]['node'])
    createConns(gameData, thing[1]["circ"]['conn'])
    
    return gameData
