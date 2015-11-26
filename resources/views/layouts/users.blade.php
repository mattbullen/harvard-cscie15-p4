@extends("layouts.master")

@section("page-css")
    <link rel="stylesheet" href="{{ URL::asset('assets/css/users.css') }}">
@stop

@section("page-content")
    <div id="row-content" class="row">
        
        <div id="left" class="large-4 columns">
        
            <button id="button-post" class="element-highlight">Get random users!</button>
            
            <h5 id="number-users-title">How many random users?</h5>
            <div id="range-slider-users" class="range-slider" data-slider data-options="initial: 1; start: 1; end: 20; step: 1;">
                <span id="range-button-users" class="range-slider-handle element-highlight" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="20" aria-valuenow="1"> </span>
                <span class="range-slider-active-segment"> </span>
                <input id="quantity-users" name="quantity-users" type="hidden">
            </div>
            
            <h5 id="spacers-title">Include which user details?</h5>
            
            <div class="checkbox-row-grouped">
                <div class="checkbox-label">Name</div>
                <input id="include-name" class="checkbox-box checkbox-box-spacers" type="checkbox" name="include-name" value="true" checked>
            </div>
            
            <div class="checkbox-row-grouped">
                <div class="checkbox-label">Address</div>
                <input id="include-address" class="checkbox-box checkbox-box-spacers" type="checkbox" name="include-address" value="true" checked>
            </div>
                       
            <div class="checkbox-row-grouped">
                <div class="checkbox-label">Phone</div>
                <input id="include-phone" class="checkbox-box checkbox-box-spacers" type="checkbox" name="include-phone" value="true" checked>
            </div>
            
            <div class="checkbox-row-grouped">
                <div class="checkbox-label">E-mail</div>
                <input id="include-email" class="checkbox-box checkbox-box-spacers" type="checkbox" name="include-email" value="true" checked>
            </div>
            
            <div class="checkbox-row-grouped">
                <div class="checkbox-label">Company</div>
                <input id="include-company" class="checkbox-box checkbox-box-spacers" type="checkbox" name="include-company" value="true" checked>
            </div>
            
            <div class="checkbox-row-grouped">
                <div class="checkbox-label">Company Description</div>
                <input id="include-catchphrase" class="checkbox-box checkbox-box-spacers" type="checkbox" name="include-catchphrase" value="true" checked>
            </div>
            
            <div class="checkbox-row-grouped">
                <div class="checkbox-label">Birthday</div>
                <input id="include-birthday" class="checkbox-box checkbox-box-spacers" type="checkbox" name="include-birthday" value="true" checked>
            </div>
                       
        </div>
        
        <div id="right" class="large-8 columns">
            <div id="content" class="nano">
                <div id="result" class="nano-content">
                    <div id="description">
                        <h3 id="description-title">Using the Random Users Generator</h3>
                        <div id="description-content">
                            <p class="description-content-paragraph">Use the slider in the menu to the left to select the number of users to generate, and use the checkboxes below it to select which details to give each. The generator defaults to one user, but you can select up to twenty.</p>
                            <p class="description-content-paragraph">Then click the "Get random users!" button above the menu, and the list of random users will be displayed in this panel. The list will be left-click selectable and will mouse scroll for easier copy/paste.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
@stop

@section("page-js")
    <script src="{{ URL::asset('assets/js/jquery.nanoscroller.min.js') }}"> </script>
    <script src="{{ URL::asset('assets/js/users.js') }}"> </script>
@stop