@extends("layouts.master")

@section("page-css")
    <link rel="stylesheet" href="{{ URL::asset('assets/css/text.css') }}">
@stop

@section("page-content")
    <div id="row-content" class="row">
    
        <div id="wrapper-input">     
            <div id="wrapper-slider">
                <div id="range-slider-paragraphs" class="range-slider" data-slider data-options="initial: 3; start: 1; end: 20; step: 1;">
                    <span id="range-button-paragraphs" class="range-slider-handle element-highlight" role="slider" tabindex="0" aria-valuemin="1" aria-valuemax="20" aria-valuenow="3"> </span>
                    <span class="range-slider-active-segment"> </span>
                    <input id="quantity-paragraphs" name="quantity-paragraphs" type="hidden">
                </div>
            </div>             
            <div class="button-link element-highlight button-post">
                <span id="button-post" class="button-href">Get lorem ipsum text!</span>
            </div>
        </div>
        
        <div id="wrapper-content">
            <div id="content" class="nano">
                <div id="result" class="nano-content">
                    <div id="description">
                        <h3 id="description-title">Using the <em>Lorem ipsum</em> Text Generator</h3>
                        <div id="description-content">
                            <p class="description-content-paragraph">Use the slider above to select the number of paragraphs to generate. The generator defaults to three paragraphs, but you can select up to twenty.</p>
                            <p class="description-content-paragraph">Then click the "Get lorem ipsum text!" button, and the new text content will be displayed in this panel. The text is left-click selectable and will mouse scroll for easier copy/paste.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
@stop

@section("page-js")
    <script src="{{ URL::asset('assets/js/jquery.nanoscroller.min.js') }}"> </script>
    <script src="{{ URL::asset('assets/js/text.js') }}"> </script>
@stop