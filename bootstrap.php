<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>collapsible demo</title>
  <link rel="stylesheet" href="//code.jquery.com/mobile/1.4.2/jquery.mobile-1.4.2.min.css"/>
  <script src="//code.jquery.com/jquery-1.10.2.min.js"></script>
  <script src="//code.jquery.com/mobile/1.4.2/jquery.mobile-1.4.2.min.js"></script>
</head>
<body>
 
<div data-role="page" id="page1">
  <div data-role="header">
    <h1>jQuery Mobile Example</h1>
  </div>
  <div role="main" class="ui-content">
    <div data-role="tabs">
      <div data-role="navbar">
        <ul>
          <li><a href="#fragment-1">One</a></li>
          <li><a href="#fragment-2">Two</a></li>
          <li><a href="#fragment-3">Three</a></li>
        </ul>
      </div>
      <div id="fragment-1">
        <p>This is the content of the tab 'One', with the id fragment-1.</p>
      </div>
      <div id="fragment-2">
        <p>This is the content of the tab 'Two', with the id fragment-2.</p>
      </div>
      <div id="fragment-3">
        <p>This is the content of the tab 'Three', with the id fragment-3.</p>
      </div>
    </div>
  </div>
</div>
</body>
 
</html>