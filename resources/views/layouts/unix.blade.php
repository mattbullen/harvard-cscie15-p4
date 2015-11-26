@extends("layouts.master")

@section("page-css")
    <link rel="stylesheet" href="{{ URL::asset('assets/css/unix.css') }}">
@stop

@section("page-content")
    <div id="row-content" class="row">

        <div id="row-description" class="row">
        
            <div id="description" class="large-12 columns">
                <h3 id="description-title">Using the Unix Permissions Generator</h3>
                <div id="description-content">
                    <p class="description-content-paragraph">Select the permissions to set using the table below, then use the "Get the permissions!" button to request the final permissions values, which will be displayed in octal/chmod-ready format in the orange box below the button.</p>
                </div>
            </div>
            
        </div>
        
        <div id="row-permissions" class="row">
            
            <div id="special" class="large-3 columns permissions-column">
            
                <h5 class="permissions-title">Special Bits</h5>
                
                <div class="checkbox-row">
                    <div class="checkbox-label">setuid</div>
                    <input id="include-setuid" class="checkbox-box" type="checkbox" name="include-setuid" value="false">
                </div>
                
                <div class="checkbox-row">
                    <div class="checkbox-label">setgid</div>
                    <input id="include-setgid" class="checkbox-box" type="checkbox" name="include-setgid" value="false">
                </div>
                
                <div class="checkbox-row">
                    <div class="checkbox-label">sticky</div>
                    <input id="include-sticky" class="checkbox-box" type="checkbox" name="include-sticky" value="false">
                </div>
                
            </div>
            
            <div id="user" class="large-3 columns permissions-column">
            
                <h5 class="permissions-title">User</h5>
                
                <div class="checkbox-row">
                    <div class="checkbox-label">Read</div>
                    <input id="include-user-read" class="checkbox-box" type="checkbox" name="include-user-read" value="false">
                </div>
                
                <div class="checkbox-row">
                    <div class="checkbox-label">Write</div>
                    <input id="include-user-write" class="checkbox-box" type="checkbox" name="include-user-write" value="false">
                </div>
                
                <div class="checkbox-row">
                    <div class="checkbox-label">Execute</div>
                    <input id="include-user-execute" class="checkbox-box" type="checkbox" name="include-user-execute" value="false">
                </div>
                
            </div>
            
            <div id="group" class="large-3 columns permissions-column">
            
                <h5 class="permissions-title">Group</h5>
                
                <div class="checkbox-row">
                    <div class="checkbox-label">Read</div>
                    <input id="include-group-read" class="checkbox-box" type="checkbox" name="include-group-read" value="false">
                </div>
                
                <div class="checkbox-row">
                    <div class="checkbox-label">Write</div>
                    <input id="include-group-write" class="checkbox-box" type="checkbox" name="include-group-write" value="false">
                </div>
                
                <div class="checkbox-row">
                    <div class="checkbox-label">Execute</div>
                    <input id="include-group-execute" class="checkbox-box" type="checkbox" name="include-group-execute" value="false">
                </div>
                
            </div>
            
            <div id="other" class="large-3 columns permissions-column">
            
                <h5 class="permissions-title">Other</h5>
                
                <div class="checkbox-row">
                    <div class="checkbox-label">Read</div>
                    <input id="include-other-read" class="checkbox-box" type="checkbox" name="include-other-read" value="false">
                </div>
                
                <div class="checkbox-row">
                    <div class="checkbox-label">Write</div>
                    <input id="include-other-write" class="checkbox-box" type="checkbox" name="include-other-write" value="false">
                </div>
                
                <div class="checkbox-row">
                    <div class="checkbox-label">Execute</div>
                    <input id="include-other-execute" class="checkbox-box" type="checkbox" name="include-other-execute" value="false">
                </div>
                
            </div>
            
        </div>
        
        <div id="row-submit" class="row">
            <div id="submit">
                <button id="button-post" class="element-highlight">Get the permissions!</button>
            </div>
        </div>
        
        <div id="row-result" class="row">
            <div id="result">
                <div id="result-content">0000</div>
            </div>
        </div>
    
    </div>
@stop

@section("page-js")
    <script src="{{ URL::asset('assets/js/unix.js') }}"> </script>
@stop