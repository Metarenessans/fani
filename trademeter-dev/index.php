<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetTitle("Трейдометр");
?>
  <!-- Include CSS -->
  <link rel="stylesheet" href="public/css/style.css">

  <!-- Yandex.Metrika counter -->
  <script type="text/javascript" >
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
    (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    ym(70442410, "init", {
      clickmap:true,
      trackLinks:true,
      accurateTrackBounce:true,
      webvisor:true
    });
  </script>
  <noscript><div><img src="https://mc.yandex.ru/watch/70442410" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
  <!-- /Yandex.Metrika counter -->

</head>
<body>
  <noscript>You need to enable JavaScript to run this app</noscript>
  <div id="root"></div>

  <script src="public/js/anychart-bundle.min.js"></script>
  <script src="public/js/jstat.min.js"></script>

  <script type="module" src="public/index-es6.js"></script>
  <script nomodule src="public/index.js"></script>

  <?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>

</body>
</html>