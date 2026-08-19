from raylib import *

def main():
    InitWindow(800, 600, b"Hello From Python")
    SetTargetFPS(60)

    camera = ffi.new("struct Camera3D *", [[18.0, 16.0, 18.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], 45.0, 0])


    while not WindowShouldClose():
        UpdateCamera(camera, CAMERA_ORBITAL)
        BeginDrawing()
        ClearBackground(BLACK)
        BeginMode3D(camera[0])
        DrawGrid(20, 1.0)
        EndMode3D()
        DrawText(b"Hello World", 200, 200, 20, WHITE)
        EndDrawing()

    CloseWindow()

if __name__ == "__main__":
    main()