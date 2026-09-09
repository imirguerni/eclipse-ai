const http = require('http');

const HOST = 'localhost';
const PORT = 5000;

const tests = [
    {
        name: 'GET /',
        method: 'GET',
        path: '/'
    },
    {
        name: 'GET /ping-veo',
        method: 'GET',
        path: '/ping-veo'
    },
    {
        name: 'POST /create-checkout-session sans authentification',
        method: 'POST',
        path: '/create-checkout-session',
        body: {
            amount: 300,
            plan: 'debutant'
        }
    },
    {
        name: 'POST /create-subscription-session sans authentification',
        method: 'POST',
        path: '/create-subscription-session',
        body: {
            plan: 'essentiel',
            interval: 'monthly'
        }
    },
    {
        name: 'POST /refund sans authentification',
        method: 'POST',
        path: '/refund',
        body: {}
    },
    {
        name: 'POST /intelligence sans authentification',
        method: 'POST',
        path: '/intelligence',
        body: {}
    },
    {
        name: 'POST /generate-image sans authentification',
        method: 'POST',
        path: '/generate-image',
        body: {}
    },
    {
        name: 'POST /generate-video sans authentification',
        method: 'POST',
        path: '/generate-video',
        body: {}
    },
    {
        name: 'POST /cancel-subscription sans authentification',
        method: 'POST',
        path: '/cancel-subscription',
        body: {}
    },
    {
        name: 'GET /api/check-active-generation sans authentification',
        method: 'GET',
        path: '/api/check-active-generation'
    },
    {
        name: 'GET /api/list-videos sans authentification',
        method: 'GET',
        path: '/api/list-videos'
    },
    {
        name: 'DELETE generation sans authentification',
        method: 'DELETE',
        path: '/api/generations/faux-user/faux-generation'
    },
    {
        name: 'Route inexistante',
        method: 'GET',
        path: '/route-qui-nexiste-pas'
    }
];

function request(test) {
    return new Promise((resolve) => {

        const body = test.body
            ? JSON.stringify(test.body)
            : null;

        const options = {
            hostname: HOST,
            port: PORT,
            path: test.path,
            method: test.method,
            headers: {}
        };

        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] =
                Buffer.byteLength(body);
        }

        const req = http.request(options, (res) => {

            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {

                resolve({
                    status: res.statusCode,
                    body: data.substring(0, 500)
                });

            });
        });

        req.setTimeout(5000, () => {

            req.destroy();

            resolve({
                status: 'TIMEOUT',
                body: ''
            });

        });

        req.on('error', (error) => {

            resolve({
                status: 'ERROR',
                body: error.message
            });

        });

        if (body) {
            req.write(body);
        }

        req.end();
    });
}

async function main() {

    console.log('');
    console.log('==============================================');
    console.log('       TEST SECURITE ROUTES HTTP');
    console.log('==============================================');
    console.log('');

    console.log(
        `Serveur teste : http://${HOST}:${PORT}`
    );

    console.log(
        `Nombre de tests : ${tests.length}`
    );

    console.log('');

    let passed = 0;
    let warnings = 0;

    for (const test of tests) {

        const result = await request(test);

        let statusText = '';

        /*
         * Une route protegee doit refuser
         * une requete sans token Firebase.
         */
        if (
            test.name.includes('sans authentification') &&
            (result.status === 401 ||
             result.status === 403)
        ) {

            statusText = '[OK] PROTEGEE';
            passed++;

        }

        /*
         * Une route inexistante doit retourner 404.
         */
        else if (
            test.name === 'Route inexistante' &&
            result.status === 404
        ) {

            statusText = '[OK] 404 CORRECT';
            passed++;

        }

        /*
         * Ton serveur ne possede probablement
         * pas de route GET /.
         */
        else if (
            test.path === '/' &&
            result.status === 404
        ) {

            statusText = '[INFO] 404 NORMAL';
            passed++;

        }

        /*
         * /ping-veo est une route de diagnostic.
         */
        else if (
            test.path === '/ping-veo'
        ) {

            statusText = '[INFO] ROUTE DIAGNOSTIC';
            warnings++;

        }

        else {

            statusText = '[ATTENTION] A ANALYSER';
            warnings++;

        }

        console.log(
            `${statusText} | ${test.method} ${test.path} | HTTP ${result.status}`
        );

        if (
            statusText.includes('A ANALYSER')
        ) {

            console.log(
                `    Reponse : ${result.body}`
            );

        }
    }

    console.log('');
    console.log('==============================================');
    console.log('                 RESULTAT');
    console.log('==============================================');

    console.log(
        `Tests valides : ${passed}`
    );

    console.log(
        `A analyser    : ${warnings}`
    );

    console.log('');

    console.log('Ce test ne fait pas :');
    console.log('- aucun paiement Stripe');
    console.log('- aucune generation authentifiee');
    console.log('- aucun debit de credits');
    console.log('- aucune suppression de donnees');

    console.log('');

}

main();