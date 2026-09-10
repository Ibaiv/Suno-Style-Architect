const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function apiWithResponse(status, body) {
    const context = vm.createContext({
        console: { log() {}, error() {} },
        AbortController, setTimeout, clearTimeout,
        window: { location: { origin: 'https://example.test' } },
        fetch: async () => ({
            ok: status >= 200 && status < 300,
            status,
            text: async () => typeof body === 'string' ? body : JSON.stringify(body)
        })
    });
    for (const file of ['config.js', 'api.js']) {
        vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', file), 'utf8'), context);
    }
    vm.runInContext("API_KEY = 'sk-or-v1-test-secret'; SELECTED_MODEL = '~anthropic/claude-fable-latest';", context);
    return context;
}

for (const [status, message, expectedHint] of [
    [400, 'Unsupported parameter: reasoning.effort', 'abgelehnt'],
    [401, 'Invalid credentials', 'API-Schlüssel'],
    [402, 'This request requires more credits, or fewer max_tokens.', 'Guthaben'],
    [403, 'Model access is restricted for this API key.', 'Zugriff'],
    [404, 'No endpoints found matching your data policy.', 'Endpunkt'],
    [429, 'Rate limit exceeded', 'begrenzt'],
    [502, 'Provider returned error', 'Modellanbieter'],
    [503, 'No available providers', 'Modellanbieter']
]) {
    test(`HTTP ${status} keeps actionable details through the feature error mapper`, async () => {
        const api = apiWithResponse(status, { error: { code: status, message } });
        await assert.rejects(api.callOpenRouterAPI('music', 'system'), error => {
            const visible = api.getUserFriendlyErrorMessage(error);
            assert.equal(visible, error.message);
            assert.match(visible, new RegExp(`OpenRouter ${status}`));
            assert.match(visible, /Claude Fable/);
            assert.ok(visible.includes(expectedHint));
            assert.ok(visible.includes(message));
            return true;
        });
    });
}

test('HTTP 200 with a provider error does not accept partial content', async () => {
    const api = apiWithResponse(200, {
        error: { code: 429, message: 'Provider overloaded' },
        choices: [{ message: { content: 'partial output' } }]
    });
    await assert.rejects(api.callOpenRouterAPI('music', 'system'), /OpenRouter 429.*Provider overloaded/);
});

test('nested provider message is retained and API credentials are redacted', async () => {
    const api = apiWithResponse(400, { error: {
        message: 'Provider rejected sk-or-v1-test-secret',
        metadata: { raw: JSON.stringify({ error: { message: 'Invalid reasoning effort' }, request: { secret: 'must not be displayed' } }) }
    } });
    await assert.rejects(api.callOpenRouterAPI('music', 'system'), error => {
        assert.match(error.message, /Invalid reasoning effort/);
        assert.doesNotMatch(error.message, /test-secret|must not be displayed/);
        return true;
    });
});

test('non-JSON HTTP failure retains the status without exposing the raw body', async () => {
    const api = apiWithResponse(502, '<html>Private gateway diagnostics</html>');
    await assert.rejects(api.callOpenRouterAPI('music', 'system'), error => {
        assert.match(error.message, /OpenRouter 502/);
        assert.doesNotMatch(error.message, /Private gateway/);
        return true;
    });
});

test('network error remains actionable at the UI layer', async () => {
    const api = apiWithResponse(200, {});
    vm.runInContext("fetch = async () => { throw new TypeError('Failed to fetch'); };", api);
    await assert.rejects(api.callOpenRouterAPI('music', 'system'), error => {
        assert.match(api.getUserFriendlyErrorMessage(error), /Verbindungsfehler/);
        return true;
    });
});

test('empty model answer reports the model and finish reason', async () => {
    const api = apiWithResponse(200, { choices: [{ message: { content: null }, finish_reason: 'stop' }] });
    await assert.rejects(api.callOpenRouterAPI('music', 'system'), error => {
        assert.match(api.getUserFriendlyErrorMessage(error), /Claude Fable.*keinen Antworttext.*stop/);
        return true;
    });
});

test('content blocks return only the final text, never reasoning', async () => {
    const api = apiWithResponse(200, { choices: [{ message: { content: [
        { type: 'reasoning', text: 'internal thinking' },
        { type: 'text', text: 'Musical prompt' }
    ] }, finish_reason: 'stop' }] });
    assert.equal(await api.callOpenRouterAPI('music', 'system'), 'Musical prompt');
});
