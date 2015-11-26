<!DOCTYPE html>

<html id="html">

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
        <link rel="stylesheet" href="{{ URL::asset('css/foundation.min.css') }}">
        <link rel="stylesheet" href="{{ URL::asset('css/base.css') }}">
        @yield("page-css")
        
        <!-- Polymer JS -->
        <script src="bower_components/webcomponentsjs/webcomponents-lite.min.js"></script>
      
    </head>
   
    <body id="body">
        
        <!-- Title Bar -->
        <div id="row-header" class="row">
            <div class="large-12 columns">
                <h2 class="row-header-title">Fitness Tracker</h2>
            </div>
        </div>

        <!-- Menu Bar 
        <div id="row-menu" class="row">
            <div class="large-12 columns">
                
                <div id="button-home" class="left button-link">
                    <a id="a-home" class="button-href" href="/">Home</a>
                </div>
                
                <div id="button-text" class="left button-link">
                    <a id="a-text" class="button-href" href="/text">Lorem Ipsum Text</a>
                </div>
                
                <div id="button-users" class="left button-link">
                    <a id="a-users" class="button-href" href="/users">Random Users</a>
                </div>
                
                <div id="button-unix" class="left button-link">
                    <a id="a-unix" class="button-href" href="/unix">Unix Permissions</a>
                </div>
                
                <div id="button-password" class="left button-link">
                    <a id="a-password" class="button-href" href="/password">XKCD Password</a>
                </div>
                
            </div>
        </div> -->
        
        <!-- Page-Specific Content -->
        @yield("page-content")
        
        <!-- JS-->
        <script src="{{ URL::asset('js/jquery.2.1.4.min.js') }}"> </script>
        <script src="{{ URL::asset('js/foundation.min.js') }}"> </script>
        @yield("page-js")
        
    </body>
   
</html>