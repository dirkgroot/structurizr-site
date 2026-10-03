# Third-party notices

The compiled `structurizr-site` binaries embed a JavaScript runtime. Their licenses are reproduced or referenced here.

## Bun

The binary is produced with [`bun build --compile`](https://bun.com/docs/bundler/executables), which embeds the Bun
runtime. Bun is licensed under the MIT License.

```text
MIT License

Copyright (c) 2022-present Jarred Sumner

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## JavaScriptCore / WebKit

The Bun runtime includes JavaScriptCore, the JavaScript engine from the WebKit project. WebKit is licensed primarily
under the GNU Lesser General Public License, version 2.1 (LGPL-2.1), with portions under the BSD 2-Clause and other
permissive licenses.

- License overview: <https://webkit.org/licensing-webkit/>
- Bun's WebKit fork: <https://github.com/oven-sh/WebKit>

If you redistribute these binaries, keep this file with them.
