import express from 'express';
// import { contextHeader, getAppContext } from '../helpers/cipher.js';
import { handleError, sanitize } from '../helpers/routing.js';
import { getInstallURL } from '../helpers/zoom-api.js';
import session from '../session.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const router = express.Router();

/*
 * Home Page - Zoom App Launch handler
 * this route is used when a user navigates to the deep link
 */
router.get('/', async (req, res, next) => {
    try {
        sanitize(req);

        // const header = req.header(contextHeader);

        // // const isZoom = header && getAppContext(header);
        // // // const name = isZoom ? 'Zoom' : 'Browser';

       return  res.sendFile(__dirname + '/index.html');;

        // return res.render('index', {
        //     isZoom,
        //     title: `Hellooo ${name}`,
        // });
    } catch (e) {
        next(handleError(e));
    }
});

/*
 * Install Route - Install the Zoom App from the Zoom Marketplace
 * this route is used when a user installs the app from the Zoom Client
 */
router.get('/install', session, async (req, res) => {
    const { url, state, verifier } = getInstallURL();
    req.session.state = state;
    req.session.verifier = verifier;
    res.redirect(url.href);
});

export default router;
