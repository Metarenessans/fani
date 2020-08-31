<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetTitle("КСД");
?>
  <!-- Include CSS -->
  <link rel="stylesheet" href="build/css/style.css">
</head>
<body>
  <noscript>You need to enable JavaScript to run this app</noscript>
  <div id="root"></div>
  
  <script type="module" src="build/index-es6.js"></script>
  <script nomodule src="build/index.js"></script>

  <?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>
</body>
</html>