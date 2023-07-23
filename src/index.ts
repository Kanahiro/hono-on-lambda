import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { serve } from '@hono/node-server';

const app = new Hono();

app.get('/', (c) => c.text('Hello Hono!'));
app.get('/name/:name', (c) => c.text(`Hello ${c.req.param('name')}!`));
app.get('/add/:a/:b', (c) => {
    const a = Number(c.req.param('a'));
    const b = Number(c.req.param('b'));
    return c.text(String(a + b));
});

//////////////////////////////
// ここからは本筋ではないおまけ //
//////////////////////////////

import fetch from 'node-fetch';

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
    c.status(200);
    c.header('Content-Type', 'image/png');
    return c.body(buf);
});

////////////////
// おまけおわり //
////////////////

export const handler = handle(app); // Lambda handler

if (process.env.NODE_ENV === 'development') {
    // snipets for local server
    console.log('Start dev server: http://localhost:3000');
    serve(app);
}
