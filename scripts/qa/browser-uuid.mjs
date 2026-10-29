// Load the installed browser implementation with the test's Web Crypto environment.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

export function browserUuid(crypto) {
  const cache = new Map();
  function load(url) {
    if (cache.has(url.href)) return cache.get(url.href);
    const exports = {};
    cache.set(url.href, exports);
    const source = ts.transpileModule(readFileSync(url, 'utf8'), {
      compilerOptions: { allowJs: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(source, {
      exports, crypto, Uint8Array,
      require: path => load(new URL(path, url)),
    });
    return exports;
  }
  return { v4: load(new URL('../../node_modules/uuid/dist/v4.js', import.meta.url)).default };
}
