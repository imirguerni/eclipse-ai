
require("dotenv").config();

const BASE_URL = (process.env.BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const TOKEN = process.env.VALID_FIREBASE_TOKEN || "";
const TEST_UID = process.env.SECURITY_TEST_UID || "";

let pass = 0;
let fail = 0;
let warn = 0;
let skip = 0;

function PASS(message) {
    pass++;
    console.log(`   🛡️ PASS : ${message}`);
}

function FAIL(message) {
    fail++;
    console.log(`   ❌ FAIL : ${message}`);
}

function WARN(message) {
    warn++;
    console.log(`   ⚠️ WARN : ${message}`);
}

function SKIP(message) {
    skip++;
    console.log(`   ⏭️ SKIP : ${message}`);
}

function separator() {
    console.log("------------------------------------------------------------");
}

function section(number, title) {
    console.log(`\n💥 [Test ${number}] ${title}`);
}

async function request(path, options = {}) {
    const url = `${BASE_URL}${path}`;

    try {
        const response = await fetch(url, {
            redirect: "manual",
            ...options,
            headers: {
                ...(options.headers || {})
            }
        });

        let body = "";

        try {
            body = await response.text();
        } catch (_) {}

        return {
            ok: true,
            status: response.status,
            headers: response.headers,
            body
        };

    } catch (error) {
        return {
            ok: false,
            status: 0,
            headers: new Headers(),
            body: "",
            error
        };
    }
}

function jsonHeaders(authenticated = false) {
    const headers = {
        "Content-Type": "application/json"
    };

    if (authenticated && TOKEN) {
        headers.Authorization = `Bearer ${TOKEN}`;
    }

    return headers;
}

function isAuthRejected(status) {
    return status === 401 || status === 403;
}

async function main() {

    console.log("\n🦹 ============================================================");
    console.log("🦹 SECURITY / RED TEAM TEST SUITE v8");
    console.log("🦹 ============================================================");
    console.log(`🎯 Cible : ${BASE_URL}`);
    console.log(`🛡️ Token statique : ${TOKEN ? "FOURNI" : "ABSENT"}`);
    console.log(`👤 Security UID : ${TEST_UID ? "FOURNI" : "ABSENT"}`);
    console.log("🧪 Tests : authentification + IDOR + injection + routes");
    console.log("🦹 ============================================================\n");

    // ============================================================
    // TEST 0 — SERVEUR
    // ============================================================

    section(0, "Vérification du serveur");

    const server = await request("/");

    if (!server.ok) {
        FAIL(`Serveur inaccessible : ${server.error?.message || "erreur réseau"}`);
        process.exitCode = 1;
        return;
    }

    PASS(`Serveur accessible — HTTP ${server.status}`);

    if (server.status === 404) {
        console.log("      ↳ HTTP 404 sur / est normal si aucune route GET / n'est définie.");
    }

    separator();

    // ============================================================
    // TEST 1 — AUTHENTIFICATION ABSENTE
    // ============================================================

    section(1, "Accès sans Authorization");

    const protectedRoutes = [
        {
            name: "/api/check-active-generation",
            path: TEST_UID
                ? `/api/check-active-generation?userId=${encodeURIComponent(TEST_UID)}`
                : "/api/check-active-generation"
        },
        {
            name: "/api/list-videos",
            path: "/api/list-videos"
        },
        {
            name: "/generate-video",
            path: "/generate-video"
        },
        {
            name: "/generate-image",
            path: "/generate-image"
        },
        {
            name: "/verify-payment",
            path: "/verify-payment"
        }
    ];

    for (const route of protectedRoutes) {

        const result = await request(route.path, {
            method: "POST",
            headers: jsonHeaders(false),
            body: JSON.stringify({})
        });

        if (!result.ok) {
            FAIL(`${route.name} : erreur réseau`);
            continue;
        }

        if (isAuthRejected(result.status)) {
            PASS(`${route.name} refuse correctement l'accès sans token — HTTP ${result.status}`);
        } else if (result.status === 404) {
            WARN(`${route.name} n'est pas présente sur cette instance — HTTP 404`);
        } else {
            FAIL(`${route.name} répond sans authentification — HTTP ${result.status}`);
        }
    }

    separator();

    // ============================================================
    // TEST 2 — TOKENS FALSIFIÉS
    // ============================================================

    section(2, "Tokens Firebase falsifiés");

    const fakeTokens = [
        "fake-token",
        "Bearer fake-token",
        "eyJhbGciOiJub25lIn0.eyJ1aWQiOiJhdHRhY2tlciJ9.",
        "eyJhbGciOiJub25lIn0.eyJ1aWQiOiJ0ZXN0In0.signature",
        "null",
        "undefined",
        "",
        "abc.def.ghi"
    ];

    const tokenTestRoute = "/api/list-videos";

    for (const fakeToken of fakeTokens) {

        const result = await request(tokenTestRoute, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${fakeToken}`
            }
        });

        if (!result.ok) {
            FAIL("Token falsifié : erreur réseau");
            continue;
        }

        if (isAuthRejected(result.status)) {
            PASS(`Token falsifié rejeté — HTTP ${result.status}`);
        } else if (result.status === 404) {
            WARN(`Route ${tokenTestRoute} absente — HTTP 404`);
        } else {
            FAIL(`Token falsifié potentiellement accepté — HTTP ${result.status}`);
        }
    }

    separator();

    // ============================================================
    // TEST 3 — TOKEN RÉEL / TOKEN STATIQUE
    // ============================================================

    section(3, "Vérification du token de sécurité");

    if (!TOKEN) {

        SKIP("VALID_FIREBASE_TOKEN absent du .env");

    } else {

        console.log("   🔑 Token de sécurité fourni au script.");
        console.log("   🔒 Le token n'est jamais affiché.");

        const result = await request("/api/list-videos", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        });

        if (!result.ok) {

            FAIL("Erreur réseau pendant le test du token.");

        } else if (isAuthRejected(result.status)) {

            FAIL(`Le backend refuse VALID_FIREBASE_TOKEN — HTTP ${result.status}`);

            if (result.body && result.body.length < 500) {
                console.log(`      ↳ ${result.body}`);
            }

        } else if (result.status === 404) {

            WARN("Token envoyé correctement mais /api/list-videos n'existe pas sur cette instance.");

        } else {

            PASS(`VALID_FIREBASE_TOKEN accepté par le backend — HTTP ${result.status}`);
        }
    }

    separator();

    // ============================================================
    // TEST 4 — SECURITY_TEST_MODE
    // ============================================================

    section(4, "Vérification du mode SECURITY_TEST_MODE");

    if (!TOKEN) {

        SKIP("Impossible de tester SECURITY_TEST_MODE sans token.");

    } else {

        const result = await request("/api/list-videos", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                "X-Security-Test": "true"
            }
        });

        if (!result.ok) {

            FAIL("Erreur réseau.");

        } else if (isAuthRejected(result.status)) {

            FAIL(`SECURITY_TEST_MODE refuse le token de sécurité — HTTP ${result.status}`);

        } else if (result.status === 404) {

            WARN("Route absente : impossible de valider SECURITY_TEST_MODE.");

        } else {

            PASS(`SECURITY_TEST_MODE accessible avec authentification — HTTP ${result.status}`);
        }
    }

    separator();

    // ============================================================
    // TEST 5 — IDOR
    // ============================================================

    section(5, "IDOR avec authentification");

    if (!TOKEN || !TEST_UID) {

        SKIP("VALID_FIREBASE_TOKEN ou SECURITY_TEST_UID absent.");

    } else {

        const attackerIds = [
            "attacker",
            "admin",
            "test",
            "00000000000000000000000000000000",
            "other-user-id"
        ];

        for (const attackerId of attackerIds) {

            const path =
                `/api/check-active-generation?userId=${encodeURIComponent(attackerId)}`;

            const result = await request(path, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            });

            if (!result.ok) {

                FAIL(`IDOR ${attackerId} : erreur réseau`);

            } else if (isAuthRejected(result.status)) {

                PASS(`IDOR ${attackerId} correctement bloqué — HTTP ${result.status}`);

            } else if (result.status === 404) {

                WARN("Route check-active-generation absente — HTTP 404");

            } else {

                console.log(`      ↳ ID testé : ${attackerId}`);
                console.log(`      ↳ HTTP ${result.status}`);

                if (result.body && result.body.length < 300) {
                    console.log(`      ↳ ${result.body}`);
                }

                WARN(`IDOR à examiner manuellement pour userId=${attackerId}`);
            }
        }
    }

    separator();

    // ============================================================
    // TEST 6 — INJECTIONS
    // ============================================================

    section(6, "Payloads d'injection");

    const injectionPayloads = [
        "' OR '1'='1",
        "\" OR \"1\"=\"1",
        "<script>alert(1)</script>",
        "{{7*7}}",
        "${7*7}",
        "../../../etc/passwd",
        "..\\..\\..\\windows\\win.ini",
        "%27%20OR%201%3D1--",
        "`id`",
        "$(whoami)",
        "'; DROP TABLE users; --"
    ];

    for (const payload of injectionPayloads) {

        const body = {
            prompt: payload,
            userId: payload,
            engineId: payload,
            cost: payload,
            duration: payload
        };

        const result = await request("/generate-image", {
            method: "POST",
            headers: jsonHeaders(Boolean(TOKEN)),
            body: JSON.stringify(body)
        });

        if (!result.ok) {

            FAIL(`Injection "${payload}" : erreur réseau`);

        } else if (result.status === 500) {

            FAIL(`Injection "${payload}" provoque HTTP 500`);

        } else if (result.status === 404) {

            WARN("/generate-image absent — injection non testable");

        } else {

            PASS(`Injection traitée sans HTTP 500 — ${payload}`);
        }
    }

    separator();

    // ============================================================
    // TEST 7 — MANIPULATION DU COÛT
    // ============================================================

    section(7, "Manipulation du coût côté client");

    if (!TOKEN) {

        SKIP("VALID_FIREBASE_TOKEN absent.");

    } else {

        const costPayloads = [
            -100,
            0,
            1,
            999999999,
            "0",
            "999999999",
            null,
            "free",
            true
        ];

        for (const cost of costPayloads) {

            const result = await request("/generate-video", {
                method: "POST",
                headers: jsonHeaders(true),
                body: JSON.stringify({
                    engineId: "test",
                    prompt: "security test",
                    duration: 1,
                    cost
                })
            });

            console.log(
                `   ↳ cost=${JSON.stringify(cost)} → HTTP ${result.status}`
            );

            if (!result.ok) {

                FAIL(`cost=${JSON.stringify(cost)} : erreur réseau`);

            } else if (result.status === 404) {

                WARN("/generate-video absent sur cette instance.");

            } else if (result.status === 500) {

                FAIL(`cost=${JSON.stringify(cost)} provoque HTTP 500`);

            } else {

                PASS(`cost=${JSON.stringify(cost)} traité sans crash`);
            }
        }
    }

    separator();

    // ============================================================
    // TEST 8 — DURATION
    // ============================================================

    section(8, "Manipulation de duration");

    if (!TOKEN) {

        SKIP("VALID_FIREBASE_TOKEN absent.");

    } else {

        const durations = [
            -1,
            0,
            1,
            999999,
            "abc",
            null,
            true
        ];

        for (const duration of durations) {

            const result = await request("/generate-video", {
                method: "POST",
                headers: jsonHeaders(true),
                body: JSON.stringify({
                    engineId: "test",
                    prompt: "security test",
                    duration
                })
            });

            console.log(
                `   ↳ duration=${JSON.stringify(duration)} → HTTP ${result.status}`
            );

            if (!result.ok) {

                FAIL(`duration=${JSON.stringify(duration)} : erreur réseau`);

            } else if (result.status === 404) {

                WARN("/generate-video absent.");

            } else if (result.status === 500) {

                FAIL(`duration=${JSON.stringify(duration)} provoque HTTP 500`);

            } else {

                PASS(`duration=${JSON.stringify(duration)} correctement traitée`);
            }
        }
    }

    separator();

    // ============================================================
    // TEST 9 — RACE CONDITION
    // ============================================================

    section(9, "Race Condition — 10 requêtes simultanées");

    if (!TOKEN) {

        SKIP("VALID_FIREBASE_TOKEN absent.");

    } else {

        const requests = Array.from({ length: 10 }, (_, i) => {

            return request("/api/check-active-generation", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "X-Request-Id": `security-race-${Date.now()}-${i}`
                }
            });
        });

        const results = await Promise.all(requests);
        const statuses = results.map(r => r.status);

        console.log(`   ↳ Réponses : ${statuses.join(", ")}`);

        if (results.some(r => !r.ok)) {

            FAIL("Une ou plusieurs requêtes ont provoqué une erreur réseau.");

        } else if (statuses.every(s => s === 404)) {

            WARN("Route absente : test Race Condition impossible.");

        } else if (statuses.some(s => s === 500)) {

            FAIL("Une requête simultanée provoque HTTP 500.");

        } else {

            PASS("10 requêtes simultanées traitées sans crash.");
        }
    }

    separator();

    // ============================================================
    // TEST 10 — DUPLICATE X-REQUEST-ID
    // ============================================================

    section(10, "Réutilisation du même X-Request-Id");

    if (!TOKEN) {

        SKIP("VALID_FIREBASE_TOKEN absent.");

    } else {

        const requestId = `duplicate-security-${Date.now()}`;

        const results = await Promise.all([

            request("/api/check-active-generation", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "X-Request-Id": requestId
                }
            }),

            request("/api/check-active-generation", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "X-Request-Id": requestId
                }
            })

        ]);

        console.log(`   ↳ Requête 1 : HTTP ${results[0].status}`);
        console.log(`   ↳ Requête 2 : HTTP ${results[1].status}`);

        if (results.every(r => r.status === 404)) {

            WARN("Route absente : impossible de tester le mécanisme X-Request-Id.");

        } else if (results.some(r => r.status === 500)) {

            FAIL("Duplicate X-Request-Id provoque HTTP 500.");

        } else {

            PASS("Duplicate X-Request-Id ne provoque pas de crash.");
        }
    }

    separator();

    // ============================================================
    // TEST 11 — WEBHOOK STRIPE
    // ============================================================

    section(11, "Faux webhook Stripe");

    const stripePayload = JSON.stringify({
        id: "evt_security_test",
        type: "payment_intent.succeeded",
        data: {
            object: {
                id: "pi_security_test",
                amount: 999999
            }
        }
    });

    const stripeResult = await request("/webhook/stripe", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: stripePayload
    });

    if (
        stripeResult.status === 400 ||
        stripeResult.status === 401 ||
        stripeResult.status === 403
    ) {

        PASS(`Faux webhook rejeté — HTTP ${stripeResult.status}`);

    } else if (stripeResult.status === 404) {

        WARN("Route webhook Stripe absente.");

    } else {

        FAIL(`Faux webhook potentiellement accepté — HTTP ${stripeResult.status}`);
    }

    separator();

    // ============================================================
    // TEST 12 — PATH TRAVERSAL
    // ============================================================

    section(12, "Path traversal");

    const traversalPaths = [
        "/../../etc/passwd",
        "/../.env",
        "/../../package.json",
        "/%2e%2e/%2e%2e/%2e%2e/etc/passwd",
        "/..\\..\\windows\\win.ini"
    ];

    for (const path of traversalPaths) {

        const result = await request(path, {
            method: "GET"
        });

        if (!result.ok) {

            FAIL(`Traversal ${path} : erreur réseau`);

        } else if (result.status === 200) {

            FAIL(`🚨 POSSIBLE FUITE : ${path} → HTTP 200`);

            if (result.body.length < 500) {
                console.log(`      ↳ ${result.body}`);
            }

        } else {

            PASS(`Traversal bloqué/non exposé : ${path} → HTTP ${result.status}`);
        }
    }

    separator();

    // ============================================================
    // TEST 13 — ROUTES SENSIBLES
    // ============================================================

    section(13, "Recherche de routes/fichiers sensibles");

    const sensitiveRoutes = [
        "/.env",
        "/.env.local",
        "/serviceAccountKey.json",
        "/firebase-adminsdk.json",
        "/package.json",
        "/package-lock.json",
        "/config",
        "/debug",
        "/admin",
        "/api/admin",
        "/api/debug",
        "/api/config",
        "/server.js",
        "/index.js"
    ];

    for (const path of sensitiveRoutes) {

        const result = await request(path);

        if (!result.ok) {

            FAIL(`${path} : erreur réseau`);

        } else if (result.status === 200) {

            FAIL(`🚨 ROUTE SENSIBLE ACCESSIBLE : ${path}`);

        } else {

            PASS(`${path} non exposé — HTTP ${result.status}`);
        }
    }

    separator();

    // ============================================================
    // TEST 14 — CORS
    // ============================================================

    section(14, "Vérification CORS");

    const corsResult = await request("/api/list-videos", {
        method: "OPTIONS",
        headers: {
            Origin: "https://evil.example",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Authorization"
        }
    });

    if (!corsResult.ok) {

        FAIL("Erreur réseau pendant le test CORS.");

    } else {

        const allowOrigin =
            corsResult.headers.get("access-control-allow-origin");

        console.log(
            `   ↳ Access-Control-Allow-Origin : ${allowOrigin || "ABSENT"}`
        );

        if (
            allowOrigin === "*" ||
            allowOrigin === "https://evil.example"
        ) {

            FAIL("CORS autorise explicitement evil.example ou *.");

        } else {

            PASS("Aucune autorisation CORS évidente pour evil.example.");
        }
    }

    separator();

    // ============================================================
    // TEST 15 — JSON MALFORMÉ
    // ============================================================

    section(15, "JSON malformé");

    const malformed = await request("/generate-image", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(TOKEN
                ? { Authorization: `Bearer ${TOKEN}` }
                : {})
        },
        body: '{"prompt":'
    });

    if (malformed.status === 400) {

        PASS("JSON malformé correctement rejeté — HTTP 400");

    } else if (malformed.status === 404) {

        WARN("/generate-image absent.");

    } else if (malformed.status === 500) {

        FAIL("JSON malformé provoque HTTP 500.");

    } else {

        PASS(`JSON malformé géré — HTTP ${malformed.status}`);
    }

    separator();

    // ============================================================
    // TEST 16 — HEADER AUTHORIZATION EXCESSIF
    // ============================================================

    section(16, "Header Authorization anormalement long");

    const hugeToken = "A".repeat(20000);

    const hugeHeader = await request("/api/list-videos", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${hugeToken}`
        }
    });

    if (
        hugeHeader.status === 431 ||
        hugeHeader.status === 400 ||
        hugeHeader.status === 401
    ) {

        PASS(
            `Header excessif correctement rejeté/géré — HTTP ${hugeHeader.status}`
        );

    } else if (hugeHeader.status === 404) {

        WARN("Route absente.");

    } else {

        WARN(
            `Header de 20 000 caractères accepté — HTTP ${hugeHeader.status}`
        );
    }

    separator();

    // ============================================================
    // RAPPORT FINAL
    // ============================================================

    console.log("\n🦹 ============================================================");
    console.log("🦹 RAPPORT FINAL SECURITY / RED TEAM v8");
    console.log("🦹 ============================================================");

    console.log(`🛡️ PASS : ${pass}`);
    console.log(`❌ FAIL : ${fail}`);
    console.log(`⚠️ WARN : ${warn}`);
    console.log(`⏭️ SKIP : ${skip}`);

    console.log("============================================================");

    if (fail === 0) {

        console.log("✅ Aucun échec critique détecté par cette suite.");

    } else {

        console.log(`🚨 ${fail} problème(s) doivent être analysés.`);
    }

    console.log("============================================================");

    console.log(`
ℹ️ INTERPRÉTATION :

PASS = le test précis n'a pas détecté le comportement recherché.

WARN = le test n'a pas pu conclure, par exemple parce qu'une
       route n'existe pas ou qu'un mécanisme n'est pas exposé.

FAIL = comportement potentiellement problématique détecté.

IMPORTANT :

Un 404 signifie simplement que la route n'existe pas.
Il n'est PAS considéré comme une authentification contournée.

Le token Firebase/SECURITY_TEST_TOKEN n'est jamais affiché.
`);

    // Code retour utile pour PowerShell / CI
    if (fail > 0) {
        process.exitCode = 2;
    } else {
        process.exitCode = 0;
    }
}

// ============================================================
// LANCEMENT
// ============================================================

main().catch(error => {

    console.error("\n💥 ERREUR FATALE DU TESTEUR");
    console.error(error);

    process.exitCode = 1;
});

