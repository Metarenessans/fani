<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetTitle("Финансовый планировщик");
?>
  <!-- Include CSS -->
  <link rel="stylesheet" href="css/style.css">

  <!-- Yandex.Metrika counter -->
  <script type="text/javascript">
    (function (d, w, c) {
      (w[c] = w[c] || []).push(function () {
        try {
          w.yaCounter70442410 = new Ya.Metrika({
            id: 70442410,
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true
          });
        } catch (e) { }
      });

      var n = d.getElementsByTagName("script")[0],
        s = d.createElement("script"),
        f = function () { n.parentNode.insertBefore(s, n); };
      s.type = "text/javascript";
      s.async = true;
      s.src = "https://mc.yandex.ru/metrika/watch.js";

      if (w.opera == "[object Opera]") {
        d.addEventListener("DOMContentLoaded", f, false);
      } else { f(); }
    })(document, window, "yandex_metrika_callbacks");
  </script>
  <!-- Yandex.Metrika counter -->
</head>
<body>
  <noscript>You need to enable JavaScript to run this app</noscript>
  <div id="root"></div>
  
  <script src="js/index.js"></script>

  <?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>
</body>
</html>