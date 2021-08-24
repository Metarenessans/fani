<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/intraday/favicon.ico" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using create-react-app"
    />
    <link rel="manifest" href="/intraday/manifest.json" />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <title>ИП Аналитика</title>
    <link href="/intraday/static/css/2.36ce068d.chunk.css" rel="stylesheet" />
    <link
      href="/intraday/static/css/main.c3148f0b.chunk.css"
      rel="stylesheet"
    />
		<?php require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php"); $APPLICATION->SetTitle("ИП Аналитика"); ?>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script>
      !(function (e) {
        function r(r) {
          for (
            var n, l, a = r[0], i = r[1], f = r[2], c = 0, s = [];
            c < a.length;
            c++
          )
            (l = a[c]),
              Object.prototype.hasOwnProperty.call(o, l) &&
                o[l] &&
                s.push(o[l][0]),
              (o[l] = 0);
          for (n in i)
            Object.prototype.hasOwnProperty.call(i, n) && (e[n] = i[n]);
          for (p && p(r); s.length; ) s.shift()();
          return u.push.apply(u, f || []), t();
        }
        function t() {
          for (var e, r = 0; r < u.length; r++) {
            for (var t = u[r], n = !0, a = 1; a < t.length; a++) {
              var i = t[a];
              0 !== o[i] && (n = !1);
            }
            n && (u.splice(r--, 1), (e = l((l.s = t[0]))));
          }
          return e;
        }
        var n = {},
          o = { 1: 0 },
          u = [];
        function l(r) {
          if (n[r]) return n[r].exports;
          var t = (n[r] = { i: r, l: !1, exports: {} });
          return e[r].call(t.exports, t, t.exports, l), (t.l = !0), t.exports;
        }
        (l.m = e),
          (l.c = n),
          (l.d = function (e, r, t) {
            l.o(e, r) ||
              Object.defineProperty(e, r, { enumerable: !0, get: t });
          }),
          (l.r = function (e) {
            "undefined" != typeof Symbol &&
              Symbol.toStringTag &&
              Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
              Object.defineProperty(e, "__esModule", { value: !0 });
          }),
          (l.t = function (e, r) {
            if ((1 & r && (e = l(e)), 8 & r)) return e;
            if (4 & r && "object" == typeof e && e && e.__esModule) return e;
            var t = Object.create(null);
            if (
              (l.r(t),
              Object.defineProperty(t, "default", { enumerable: !0, value: e }),
              2 & r && "string" != typeof e)
            )
              for (var n in e)
                l.d(
                  t,
                  n,
                  function (r) {
                    return e[r];
                  }.bind(null, n)
                );
            return t;
          }),
          (l.n = function (e) {
            var r =
              e && e.__esModule
                ? function () {
                    return e.default;
                  }
                : function () {
                    return e;
                  };
            return l.d(r, "a", r), r;
          }),
          (l.o = function (e, r) {
            return Object.prototype.hasOwnProperty.call(e, r);
          }),
          (l.p = "/intraday/");
        var a = (this.webpackJsonpzmeev = this.webpackJsonpzmeev || []),
          i = a.push.bind(a);
        (a.push = r), (a = a.slice());
        for (var f = 0; f < a.length; f++) r(a[f]);
        var p = i;
        t();
      })([]);
    </script>
    <script src="/intraday/static/js/2.2f18db5b.chunk.js"></script>
    <script src="/intraday/static/js/main.30f575e1.chunk.js"></script>
		<?php require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php"); ?>
  </body>
</html>
