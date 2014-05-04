This is a fork of the [perfect scrollbar](http://noraesae.github.io/perfect-scrollbar/) project.

Ironically, it wasn't perfect. 

It didn't have support to have the scroll bar outside of the container, nor
did it allow for support the have the rail be a different size than the content.

All of the other scroll plugins are terrible when used on multiple platforms
(i.e. touch,mouse) so it just a matter of modifying this one.

__Most_ of the documentation is the same, except for one new option that was added
to control the scale of the scroll rail.

scrollSizeRatio: Number //Default .8
	- The ratio of the rail size to
	the content. <1 = Smaller

Since a lot of the functionality was not needed and bandwidth was a
concern, certain __features__ have been removed.

__Horizontal Scrolling__: Completely removed. No options related to
it will function.

__Keyboard Support__: Removed keyboad support. Mousewheel remains.

__IE6 Support__: IE6 Support was removed.

__Data Keys__: All data keys had the string "perfect-scrollbar"
replaced with "contained-scroll"

__Init Method__: Init Method renamed to containedScroll.
$(ele).containedScroll({ options: 1 });
