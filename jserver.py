from flask import Flask, jsonify
from flask_cors import CORS
import core
import lib

OFFSET = (531, 153)

last_sended = {}

app = Flask(__name__)
CORS(app)

def pixels_data(number, next=False):
    number = int(number)
    px = lib.complete_random_color()
    rpx = lib.get_rest_of_pixel(px, OFFSET)
    rest = len(rpx)
    res = rpx

    colors = []
    coords = []

    if next:
        if len(rpx) > number*2:
            res = rpx[number:number*2]
        else:
            res = rpx[-number:]
    else:
        if len(rpx) > number:
            res = rpx[:number]

    for x, y, c in res:
        colors.append(core.Core.colors.index(c)+1)
        coords.append(OFFSET[0]+x)
        coords.append(OFFSET[1]+y)

    return {"colors": colors, "coords": coords}, rest

@app.route('/pixels/<number>', methods=['GET'])
def receive_post(number:str):
    global last_sended

    number = int(number.split(".")[0])
    data, rest = pixels_data(number)

    if last_sended == data:
        data, rest = pixels_data(number, next=True)

    last_sended = data

    print(f"[INFO] Count : {number}\n{' '*7}Colors: {data['colors'][:3]}...\n{' '*7}Coords: {data['coords'][:3]}...\n{' '*7}Rest  : {rest}px")

    return jsonify(data), 200

if __name__ == "__main__":
    app.run(debug=False)
