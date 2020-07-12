<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetTitle("Трейдометр");
?>
  <!-- Include CSS -->
  <link rel="stylesheet" href="dist/css/style.css">
</head>
<body>
  <noscript>You need to enable JavaScript to run this app</noscript>
  <div id="root"></div>

  <script src="https://cdn.anychart.com/releases/8.7.1/js/anychart-bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/jstat@latest/dist/jstat.min.js"></script>
  <script src="dist/main.min.js"></script>

  <?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>

</body>
</html>