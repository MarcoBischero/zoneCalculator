;(function($){$.fn.typeSearch=function(options){var defaults={results:0,autosave:''};var options=$.extend(defaults,options);return this.filter(':text').each(function(){var el=$(this);if($.browser.safari){this.setAttribute('type','search');this.setAttribute('results',options.results);if(options.autosave)this.setAttribute('autosave',options.autosave);}
else{var val=$.trim(el.val());var width=el.outerWidth();var margin=[];var directions=['top','right','bottom','left'];for(var i=0,len=directions.length;i<len;i++)margin.push(el.css('margin-'+directions[i]));var focusSearchbar=function(){searchbar.focus();}
var wrapper=$('<div class="type-search-container">')
.width(width)
.css('margin',margin.join(' '));var left=$('<span class="left"></span>').click(focusSearchbar);var right=$('<span class="right"></span>').click(focusSearchbar);var reset=$('<div class="reset"></div>').click(function(){searchbar.val('').focus();reset.hide();});if(val=='')reset.hide();var searchbar=$('<input type="text" class="type-search">')
.attr({'id':el.attr('id'),'name':el.attr('name')})
.insertAfter(el)
.wrap(wrapper)
.before(left)
.after(reset)
.after(right)
.width(width-left.outerWidth()-right.outerWidth())
.css({'left':left.outerWidth(),'outline':0})
.focus(function(){searchbar.val('');})
.blur(function(){searchbar.val(options.placeholder);})
.keyup(function(){($.trim(searchbar.val())=='')?reset.hide():reset.show();});el.remove();}});};})(jQuery);