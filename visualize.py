from raylib import *
import pyray as pr
import interpreter as ip

gameData = ip.doSmth()
# gameData = {
#     "nd_count": 3,
#     "nd_id": [0, 1, 2],
#     "nd_pos": [pr.Vector2(0, 0), pr.Vector2(400, 300), pr.Vector2(200, 500)],
#     "nd_rad": [32, 32, 32],
#    
#     "con_count": 2,
#     "con_id": [0, 1],
#     "con_points": [(0, 1), (1, 2)],
#     "box_side_dim": [(50, 100), (50, 100)],
#     
#     "selected_id": -1,
# }

balance = {
    "ln_thickness": 5,
    "rect_roundness": 0.2,
    "font_size": 20,
}

def drawNodes(gameData):
    for i in range(0, gameData["nd_count"]):
        DrawCircleV(gameData["nd_pos"][i], gameData["nd_rad"][i], RED)
        
        text = gameData["nd_name"][i]
        text_dim = MeasureText(text, balance["font_size"])
        DrawText(gameData["nd_name"][i], int(gameData["nd_pos"][i].x - text_dim/2), int(gameData["nd_pos"][i].y - balance["font_size"]/2), balance["font_size"], BLACK)
    return
    
    
def handleClick(gameData):
    for i in range(0, gameData["nd_count"]):
        if (IsMouseButtonPressed(MOUSE_BUTTON_LEFT) and CheckCollisionPointCircle(GetMousePosition(), gameData["nd_pos"][i], gameData["nd_rad"][i])):
            gameData["selected_id"] = i
            break
        if (IsMouseButtonDown(MOUSE_BUTTON_LEFT) and i == gameData["selected_id"]):
            gameData["nd_pos"][i] = GetMousePosition()
        if (IsMouseButtonReleased(MOUSE_BUTTON_LEFT) and i == gameData["selected_id"]):
            gameData["selected_id"] = -1
    return
    
def drawConnections(gameData, balance):
    for i in range(0, gameData["con_count"]):
        first_point = gameData["nd_pos"][gameData["con_points"][i][0]]
        second_point = gameData["nd_pos"][gameData["con_points"][i][1]]
        
        # might separate into anouther function later
        vect_diff = Vector2Scale(Vector2Subtract(second_point, first_point), 0.5)
        midpoint = Vector2Add(gameData["nd_pos"][gameData["con_points"][i][0]], vect_diff)
        
        x_offset = int(midpoint.x - gameData["box_side_dim"][i][1]/2)
        y_offset = int(midpoint.y - gameData["box_side_dim"][i][0]/2)
        width = gameData["box_side_dim"][i][1]
        height = gameData["box_side_dim"][i][0]
        
        rect_center_x = x_offset + int(width/2)
        rect_center_y = y_offset + int(height/2)
        rect_center = pr.Vector2(rect_center_x, rect_center_y)

        rectangle = pr.Rectangle(x_offset, y_offset, width, height)
        
        text = gameData["con_name"][i]
        text_dim = MeasureText(text, balance["font_size"])
        
        DrawLineEx(first_point, rect_center, balance["ln_thickness"], YELLOW)
        DrawLineEx(rect_center, second_point, balance["ln_thickness"], YELLOW)
        
        DrawRectangleRounded(rectangle, balance["rect_roundness"], 0, WHITE)
        
        DrawText(text, int(rect_center_x - text_dim/2), y_offset+int((height-balance["font_size"])/2), balance["font_size"], BLACK)
    return
    
def drawConnectionBox(gameData, balance):
    pass

def main():
    InitWindow(800, 600, b"Testing")
    SetTargetFPS(60)

    # camera = ffi.new("struct Camera3D *", [[18.0, 16.0, 18.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 45.0, 0])
    
    # start_pos = pr.Vector2(0, 0)
    
    # position = pr.Vector2(400, 300)
    # radius = 32
    # selected = False
    # box_side_dim = 100

    while not WindowShouldClose():
        # UpdateCamera(camera, CAMERA_ORBITAL)
        
            
        
        BeginDrawing()
        
        ClearBackground(GetColor(0x202020FF))
        
        # BeginMode3D(camera[0])
        # DrawGrid(20, 1.0)
        # EndMode3D()
        
        
        handleClick(gameData)
        
        
        drawConnections(gameData, balance)
        drawNodes(gameData)
        
        # DrawText(b"Hello World", 200, 200, 20, WHITE)
        # DrawCircleV(position, radius, RED)
        
        # DrawLineEx(start_pos, position, 5, BLUE)
        # DrawRectangleRounded(rectangle, 0.2, 0, WHITE)
        EndDrawing()

    CloseWindow()

if __name__ == "__main__":
    main()