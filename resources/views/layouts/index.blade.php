@extends("layouts.master")

@section("page-css")
    <link rel="stylesheet" href="{{ URL::asset('css/index.css') }}">
@stop

@section("page-content")
    <style>
        input[type="text"] {
            width: 20%;
        }
    </style>
    
    <!-- Title Bar -->
    <div id="row-header" class="row">
        <div class="large-12 columns">
            <h2 class="row-header-title">Fitness Tracker</h2>
        </div>
    </div>
    
    <!-- Page Content -->
    <div id="row-content" class="row">
        <div id="wrapper">
            <input id="input-exercise-create" type="text"></input>
            <button id="button-exercise-create">Create</button>
            <input id="input-exercise-read" type="text"></input>
            <button id="button-exercise-read">Read</button>
            <input id="input-exercise-update-name" type="text"></input>
            <input id="input-exercise-update-updateTo" type="text"></input>
            <button id="button-exercise-update">Update</button>
            <input id="input-exercise-delete" type="text"></input>
            <button id="button-exercise-delete">Delete</button>
            
        </div>
        <div id="log"></div>
    </div>
@stop

@section("page-js")
    <script src="{{ URL::asset('js/index.js') }}"> </script>
@stop