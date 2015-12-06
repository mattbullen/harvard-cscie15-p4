<!DOCTYPE html>

<html>

    <head>
   
        <!-- Meta-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=Edge">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=3">
        <meta name="description" content="CSCI E-15 Final Project">
        <meta name="author" content="Matthew Bullen">
        <meta name="csrf-token" content="<?php echo csrf_token() ?>" />
        
        <!-- Page Title & Favicon-->
        <title>CSCI E-15 Final Project</title>
        <link id="favicon" rel="shortcut icon" href="{{ URL::asset('img/favicon.png') }}" type="image/png">
        
        <!-- CSS-->
        <link rel="stylesheet" href="{{ URL::asset('css/normalize.css') }}">
        <link rel="stylesheet" href="{{ URL::asset('css/app.css') }}">

        <!-- Polymer JS -->
        <script src="{{ URL::asset('polymer/webcomponentsjs/webcomponents-lite.min.js') }}"> </script>
        
        <!-- Polymer Elements Import -->
        <link href="{{ URL::asset('elements/app.html') }}" rel="import">
        
    </head>
   
    <body fullbleed unresolved>
        
        <!-- Imported Polymer Template -->
        <base-app> <base-app>
        
    </body>
   
</html>