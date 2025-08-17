import core
from PIL import Image
import numpy as np
import random
import requests
import io

def get_pixels():
    img = Image.open(core.Core.image).convert("RGBA")
    return np.asarray(img)

def list2tuple(l) -> tuple[int, int, int, int]:
    return (int(l[0]), int(l[1]), int(l[2]), int(l[3]))

def complete_random_color(seed=8, color=1) -> list[tuple[int, int, list]]:
    """
    seed: index de génération
    color: 0 - que le transparent
           1 - que les couleurs
           2 - tous
    """
    if 0 <= color <= 1:
        c = 255 if color == 1 else 0
        colors = [(ix, iy, list(x)) for iy, y in enumerate(get_pixels()) for ix, x in enumerate(y) if x[-1] == c]
    else:
        colors = [(ix, iy, list(x)) for iy, y in enumerate(get_pixels()) for ix, x in enumerate(y)]
    # random.Random(seed).shuffle(colors)
    return colors

def get_current_paint():
    img = requests.get(core.Core.current_paint, verify=False).content
    return Image.open(io.BytesIO(img))

def get_rest_of_pixel(pixel_list:list[tuple[int, int, list]], template_offset:tuple[int, int]) -> list[tuple[int, int, tuple]]:
    rest = []
    
    paint = get_current_paint().convert("RGBA")

    img_w, img_h = Image.open(core.Core.image).size
    paint = paint.crop((template_offset[0], template_offset[1], template_offset[0]+img_w, template_offset[1]+img_h))

    paint_px = np.asarray(paint)

    for x, y, color in pixel_list:
        if list(paint_px[y][x]) != color:
            rest.append((x, y, list2tuple(color)))

    return rest
