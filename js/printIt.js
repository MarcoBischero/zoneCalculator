/*
* jQuery printIt
* Print's the selected elements to the printer
* Copyright Michael Reed, 2014
* Dual licensed under the MIT and GPL licenses.
*/
(function($){
    var defaults = {
        elems           :null, //Element to print HTML
        copy_css        :false,//Copy CSS from original element
        external_css    :null  //New external css file to apply
    };

    var methods = {
        init : function (options) {
            var settings = $.extend({}, defaults, options)
            elems=$(settings.elems);
            return this.each(function () {
                $(this).click(function(e) {
                    var iframe   = document.createElement('iframe');
                    document.body.appendChild(iframe);
                    $(iframe).load(function(){
                        elems.each(function(){
                            iframe.contentWindow.document.body.appendChild(this.cloneNode(true));
                        });
                        if(settings.copy_css) {
                            var arrStyleSheets = document.getElementsByTagName("link");
                            for (var i = 0; i < arrStyleSheets.length; i++){
                                iframe.contentWindow.document.head.appendChild(arrStyleSheets[i].cloneNode(true));
                            }
                            var arrStyle = document.getElementsByTagName("style");
                            for (var i = 0; i < arrStyle.length; i++){    
                                iframe.contentWindow.document.head.appendChild(arrStyle[i].cloneNode(true));
                            }
                        }
                        if(settings.external_css) {
                            var style  = document.createElement("link")
                            style.rel  = 'stylesheet';
                            style.type = 'text/css';
                            style.href = settings.external_css;
                            iframe.contentWindow.document.head.appendChild(style);
                        }
                        var script   = document.createElement('script');
                        script.type  = 'text/javascript';
                        script.text  = 'window.print();';
                        iframe.contentWindow.document.head.appendChild(script);
                        $(iframe).hide();
                    });
                });
            });
        },
        destroy : function () {
            //Anything else I should do here?
            delete settings;
            return this.each(function () {});
        }
    };

    $.fn.printIt = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.printIt');
        }    
    };
    }(jQuery)
);