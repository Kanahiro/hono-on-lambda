import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { serve } from '@hono/node-server';

import fetch from 'node-fetch';
import { decode, encode } from 'fast-png';

const gsidem2terrainrgb = (r: number, g: number, b: number) => {
    // https://qiita.com/frogcat/items/d12bed4e930b83eb3544
    let rgb = (r << 16) + (g << 8) + b;
    let h = 0;
    if (rgb < 0x800000) h = rgb * 0.01;
    else if (rgb > 0x800000) h = (rgb - Math.pow(2, 24)) * 0.01;
    rgb = Math.floor((h + 10000) / 0.1);
    const tR = (rgb & 0xff0000) >> 16;
    const tG = (rgb & 0x00ff00) >> 8;
    const tB = rgb & 0x0000ff;
    return [tR, tG, tB];
};

const app = new Hono();

app.get('/', (c) => c.text('Hello Hono!'));

app.get('/name/:name', (c) => c.text(`Hello ${c.req.param('name')}!`));

app.get('/add/:a/:b', (c) => {
    const a = Number(c.req.param('a'));
    const b = Number(c.req.param('b'));
    return c.text(String(a + b));
});

app.get('/tiles/:z/:x/:y', async (c) => {
    const z = Number(c.req.param('z'));
    const x = Number(c.req.param('x'));
    const y = Number(c.req.param('y'));
    const res = await fetch(
        'https://cyberjapandata.gsi.go.jp/xyz/dem_png/{z}/{x}/{y}.png'
            .replace('{z}', String(z))
            .replace('{x}', String(x))
            .replace('{y}', String(y)),
    );
    const buf = await res.arrayBuffer();

    const { width, height, data } = decode(buf);
    const length = 3;
    for (let i = 0; i < data.length / length; i++) {
        const tRGB = gsidem2terrainrgb(
            data[i * length],
            data[i * length + 1],
            data[i * length + 2],
        );
        data[i * length] = tRGB[0];
        data[i * length + 1] = tRGB[1];
        data[i * length + 2] = tRGB[2];
    }
    const encoded = Buffer.from(encode({ width, height, data, channels: 3 }));

    c.status(200);
    c.header('Content-Type', 'image/png');
    return c.body(encoded);
});

if (process.env.NODE_ENV === 'development') {
    console.log('Start dev server: http://localhost:3000');
    serve(app);
}

export const handler = handle(app);
