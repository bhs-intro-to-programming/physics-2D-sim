import {
    setCanvas,
    drawRect,
    drawFilledRect,
    drawRoundedRect,
    drawFilledRoundedRect,
    drawText,
    width,
    height
} from './graphics.js';

import {
    canvas
} from './script.js';


setCanvas(canvas);
//I'm gonna figure out a way to make this take 2 arguments: width and height of canvas
const drawGUI = () => {
    const extra = (height - 430) / 2
    drawFilledRoundedRect(width - 150, 0, 150, height, 20, 0, 0, 20, 'gray');
    for (let i = 0; i < 10; i++) {
        if (i > 2) {
            drawFilledRoundedRect(width - 130, 45 * i + extra, 110, 25, 5, 5, 5, 5, '#ADD8E9');
        } else {
            drawFilledRect(width - 130, 45 * i + extra, 110, 25, 'white');
        };
    };
    drawText('Circle', width - 95, extra + 153, 'black', 15);
    drawText('Rhombus', width - 107, extra + 198, 'black', 15);
    drawText('Trapezoid', width - 111, extra + 243, 'black', 15);
    drawText('Star', width - 90, extra + 288, 'black', 15);
    drawText('R. Triangle', width - 113, extra + 333, 'black', 15);
};
drawGUI();