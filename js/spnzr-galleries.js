/* jshint sub: true, onevar: false, multistr: true, devel: true, smarttabs: true */
/* global jetpackCarouselStrings, DocumentTouch */



jQuery(document).ready(function($) {

  // gallery faded layer and container elements
  var overlay,
      gallery,
      container,
      nextButton,
      previousButton,
      info,
      transitionBegin,
      caption,
      resizeTimeout,
      photo_info,
      close_hint,
      commentInterval,
      lastSelectedSlide,
      screenPadding = 110,
      originalOverflow = $('body').css('overflow'),
      originalHOverflow = $('html').css('overflow'),
      proportion = 85,
      last_known_location_hash = '',
      imageMeta,
      titleAndDescription,
      commentForm,
      leftColWrapper,
      scrollPos
      ;

  if ( window.innerWidth <= 760 ) {
    screenPadding = Math.round( ( window.innerWidth / 760 ) * 110 );

    if ( screenPadding < 40 && ( ( 'ontouchstart' in window ) || window.DocumentTouch && document instanceof DocumentTouch ) ) {
      screenPadding = 0;
    }
  }

  // Adding a polyfill for browsers that do not have Date.now
  if ( 'undefined' === typeof Date.now ) {
    Date.now = function now() {
      return new Date().getTime();
    };
  }

  var keyListener = function(e){
    switch(e.which){
      case 38: // up
        e.preventDefault();
        container.scrollTop(container.scrollTop() - 100);
        break;
      case 40: // down
        e.preventDefault();
        container.scrollTop(container.scrollTop() + 100);
        break;
      case 39: // right
        e.preventDefault();
        gallery.jp_carousel('next');
        break;
      case 37: // left
      case 8: // backspace
        e.preventDefault();
        gallery.jp_carousel('previous');
        break;
      case 27: // escape
        e.preventDefault();
        container.jp_carousel('close');
        break;
      default:
        // making jslint happy
        break;
    }
  };

  var resizeListener = function(/*e*/){
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function(){
      gallery
        .jp_carousel('slides')
        .jp_carousel('fitSlide', true);
      gallery.jp_carousel('updateSlidePositions', true);
      gallery.jp_carousel('fitMeta', true);
    }, 200);
  };

  var prepareGallery = function( /*dataCarouselExtra*/ ){
    if (!overlay) {
      overlay = $('<div></div>')
        .addClass('carousel-overlay')
        .css({
          'position' : 'fixed',
          'top'      : 0,
          'right'    : 0,
          'bottom'   : 0,
          'left'     : 0
        });

      caption    = $('<h2 itemprop="caption description"></h2>');
      photo_info = $('<div class="carousel-photo-info"></div>').append(caption);

      /*
       * removing image meta
       *
       */
       imageMeta = $('<div></div>')
        // .addClass('carousel-image-meta')
        .css({
          'float'      : 'right',
          'margin-top' : '20px',
          'width'      :  '250px'
        });

      /*imageMeta
        .append( '<ul class=\'carousel-image-exif\' style=\'display:none;\'></ul>' )
        .append( '<a class=\'carousel-image-download\' style=\'display:none;\'></a>' )
        .append( '<div class=\'carousel-image-map\' style=\'display:none;\'></div>' );*/

      titleAndDescription = $('<div></div>')
        .addClass('carousel-titleanddesc')
        .css({
          'width'      : '100%',
          'margin-top' : imageMeta.css('margin-top')
        });

      var leftWidth = ( $(window).width() - ( screenPadding * 2 ) ) - (imageMeta.width() + 40);
      leftWidth += 'px';

      leftColWrapper = $('<div></div>')
        .addClass('carousel-left-column-wrapper')
        .css({
          'width' : Math.floor( leftWidth )
        })
        .append(titleAndDescription);

      var fadeaway = $('<div></div>')
        .addClass('carousel-fadeaway');

      info = $('<div></div>')
        .addClass('carousel-info')
        .css({
          'top'   : Math.floor( ($(window).height() / 100) * proportion ),
          'left'  : screenPadding,
          'right' : screenPadding
        })
        .append(photo_info)
        .append(imageMeta);

      if ( window.innerWidth <= 760 ) {
        photo_info.remove().insertAfter( titleAndDescription );
        info.prepend( leftColWrapper );
      }
      else {
        info.append( leftColWrapper );
      }

      var targetBottomPos = ( $(window).height() - parseInt( info.css('top'), 10 ) ) + 'px';

      nextButton = $('<div><span></span></div>')
        .addClass('carousel-next-button')
        .css({
          'right'    : '15px'
        })
        .hide();

      previousButton = $('<div><span></span></div>')
        .addClass('carousel-previous-button')
        .css({
          'left'     : 0
        })
        .hide();

      nextButton.add( previousButton ).css( {
        'position' : 'fixed',
        'top' : '40px',
        'bottom' : targetBottomPos,
        'width' : screenPadding
      } );

      gallery = $('<div></div>')
        .addClass('carousel')
        .css({
          'position' : 'absolute',
          'top'      : 0,
          'bottom'   : targetBottomPos,
          'left'     : 0,
          'right'    : 0
        });

      close_hint = $('<div class="carousel-close-hint"><span>&times;</span></div>')
        .css({
          position : 'fixed'
        });

      container = $('<div></div>')
        .addClass('carousel-wrap')
        .addClass( 'carousel-transitions' );
      if ( 'white' === jetpackCarouselStrings.background_color ) {
         container.addClass('carousel-light');
      }

      container.attr('itemscope', '');

      container.attr('itemtype', 'https://schema.org/ImageGallery');

      container.css({
          'position'   : 'fixed',
          'top'        : 0,
          'right'      : 0,
          'bottom'     : 0,
          'left'       : 0,
          'z-index'    : 2147483647,
          'overflow-x' : 'hidden',
          'overflow-y' : 'auto',
          'direction'  : 'ltr'
        })
        .hide()
        .append(overlay)
        .append(gallery)
        .append(fadeaway)
        .append(info)
        .append(nextButton)
        .append(previousButton)
        .append(close_hint)
        .appendTo($('body'))
        .click(function(e){
          var target = $(e.target), wrap = target.parents('div.carousel-wrap'), data = wrap.data('carousel-extra'),
            slide = wrap.find('div.selected'), attachment_id = slide.data('attachment-id');
          data = data || [];

          if ( target.is(gallery) || target.parents().add(target).is(close_hint) ) {
            container.jp_carousel('close');
          } 
           else if ( ! target.parents( '.carousel-info' ).length ) {
            container.jp_carousel('next');
          }
        })
        .bind('jp_carousel.afterOpen', function(){
          $(window).bind('keydown', keyListener);
          $(window).bind('resize', resizeListener);
          gallery.opened = true;

          resizeListener();
        })
        .bind('jp_carousel.beforeClose', function(){
          var scroll = $(window).scrollTop();

          $(window).unbind('keydown', keyListener);
          $(window).unbind('resize', resizeListener);
          $(window).scrollTop(scroll);
          $( '.carousel-previous-button' ).hide();
          $( '.carousel-next-button' ).hide();
        })
        .bind('jp_carousel.afterClose', function(){
          if ( window.location.hash && history.back ) {
            history.back();
          }
          last_known_location_hash = '';
          gallery.opened = false;
        })
        .on( 'transitionend.carousel ', '.carousel-slide', function ( e ) {
          // If the movement transitions take more than twice the allotted time, disable them.
          // There is some wiggle room in the 2x, since some of that time is taken up in
          // JavaScript, setting up the transition and calling the events.
          if ( 'transform' === e.originalEvent.propertyName ) {
            var transitionMultiplier = ( ( Date.now() - transitionBegin ) / 1000 ) / e.originalEvent.elapsedTime;

            container.off( 'transitionend.carousel' );

            if ( transitionMultiplier >= 2 ) {
              $( '.carousel-transitions' ).removeClass( 'carousel-transitions' );
            }
          }
        } );

        $( '.carousel-wrap' ).touchwipe( {
          wipeLeft : function ( e ) {
            e.preventDefault();
            gallery.jp_carousel( 'next' );
          },
          wipeRight : function ( e ) {
            e.preventDefault();
            gallery.jp_carousel( 'previous' );
          },
          preventDefaultEvents : false
        } );

      nextButton.add(previousButton).click(function(e){
        e.preventDefault();
        e.stopPropagation();
        if ( nextButton.is(this) ) {
          gallery.jp_carousel('next');
        } else {
          gallery.jp_carousel('previous');
        }
      });
    }
  };

  var processSingleImageGallery = function() {
    // process links that contain img tag with attribute data-attachment-id
    $( 'a img[data-attachment-id]' ).each(function() {
      var container = $( this ).parent();

      // skip if image was already added to gallery by shortcode
      if( container.parent( '.gallery-icon' ).length ) {
        return;
      }

      // skip if the container is not a link
      if ( 'undefined' === typeof( $( container ).attr( 'href' ) ) ) {
        return;
      }

      var valid = false;

      // if link points to 'Media File' (ignoring GET parameters) and flag is set allow it
      if ( 
        $( container ).attr( 'href' ).split( '?' )[0] === $( this ).attr( 'data-orig-file' ).split( '?' )[0] 
      ) {
        valid = true;
      }

      // if link points to 'Attachment Page' allow it
      if( $( container ).attr( 'href' ) === $( this ).attr( 'data-permalink' ) ) {
        valid = true;
      }

      // links to 'Custom URL' or 'Media File' when flag not set are not valid
      if( ! valid ) {
        return;
      }

      // make this node a gallery recognizable by event listener above
      $( container ).addClass( 'single-image-gallery' ) ;
      
    });
  };

  var methods = {
    testForData: function(gallery) {
      gallery = $( gallery ); // make sure we have it as a jQuery object.
      return !( ! gallery.length || ! gallery.data( 'carousel-extra' ) );
    },

    testIfOpened: function() {
      return !!( 'undefined' !== typeof(gallery) && 'undefined' !== typeof(gallery.opened) && gallery.opened );
    },

    openOrSelectSlide: function( index ) {
      // The `open` method triggers an asynchronous effect, so we will get an
      // error if we try to use `open` then `selectSlideAtIndex` immediately
      // after it. We can only use `selectSlideAtIndex` if the carousel is
      // already open.
      if ( ! $( this ).jp_carousel( 'testIfOpened' ) ) {
        // The `open` method selects the correct slide during the
        // initialization.
        $( this ).jp_carousel( 'open', { start_index: index } );
      } else {
        gallery.jp_carousel( 'selectSlideAtIndex', index );
      }
    },

    open: function(options) {
      var settings = {
        'items_selector' : '.gallery-item [data-attachment-id], .tiled-gallery-item [data-attachment-id], img[data-attachment-id]',
        'start_index': 0
      },
      data = $(this).data('carousel-extra');

      if ( !data ) {
        return; // don't run if the default gallery functions weren't used
      }

      prepareGallery( data );

      if ( gallery.jp_carousel( 'testIfOpened' ) ) {
        return; // don't open if already opened
      }

      // make sure to stop the page from scrolling behind the carousel overlay, so we don't trigger
      // infiniscroll for it when enabled (Reader, theme infiniscroll, etc).
      originalOverflow = $('body').css('overflow');
      $('body').css('overflow', 'hidden');
      // prevent html from overflowing on some of the new themes.
      originalHOverflow = $('html').css('overflow');
      $('html').css('overflow', 'hidden');
      scrollPos = $( window ).scrollTop();

      container.data('carousel-extra', data);

      return this.each(function() {
        // If options exist, lets merge them
        // with our default settings
        var $this = $(this);

        if ( options ) {
          $.extend( settings, options );
        }
        if ( -1 === settings.start_index ) {
          settings.start_index = 0; //-1 returned if can't find index, so start from beginning
        }

        container.trigger('jp_carousel.beforeOpen').fadeIn('fast',function(){
          container.trigger('jp_carousel.afterOpen');
          gallery
            .jp_carousel('initSlides', $this.find(settings.items_selector), settings.start_index)
            .jp_carousel('selectSlideAtIndex', settings.start_index);
        });
        gallery.html('');
      });
    },

    selectSlideAtIndex : function(index){
      var slides = this.jp_carousel('slides'), selected = slides.eq(index);

      if ( 0 === selected.length ) {
        selected = slides.eq(0);
      }

      gallery.jp_carousel('selectSlide', selected, false);
      return this;
    },

    close : function(){
      // make sure to let the page scroll again
      $('body').css('overflow', originalOverflow);
      $('html').css('overflow', originalHOverflow);
      return container
        .trigger('jp_carousel.beforeClose')
        .fadeOut('fast', function(){
          container.trigger('jp_carousel.afterClose');
          $( window ).scrollTop( scrollPos );
        });

    },

    next : function() {
      this.jp_carousel( 'previousOrNext', 'nextSlide' );
    },

    previous : function() {
      this.jp_carousel( 'previousOrNext', 'prevSlide' );
    },

    previousOrNext : function ( slideSelectionMethodName ) {
      if ( ! this.jp_carousel( 'hasMultipleImages' ) ) {
        return false;
      }

      var slide = gallery.jp_carousel( slideSelectionMethodName );

      if ( slide ) {
        container.animate( { scrollTop: 0 }, 'fast' );
        this.jp_carousel( 'selectSlide', slide );
      }
    },

    selectedSlide : function(){
      return this.find('.selected');
    },

    setSlidePosition : function(x) {
      transitionBegin = Date.now();

      return this.css({
          '-webkit-transform':'translate3d(' + x + 'px,0,0)',
          '-moz-transform':'translate3d(' + x + 'px,0,0)',
          '-ms-transform':'translate(' + x + 'px,0)',
          '-o-transform':'translate(' + x + 'px,0)',
          'transform':'translate3d(' + x + 'px,0,0)'
      });
    },

    updateSlidePositions : function(animate) {
      var current = this.jp_carousel( 'selectedSlide' ),
        galleryWidth = gallery.width(),
        currentWidth = current.width(),
        previous = gallery.jp_carousel( 'prevSlide' ),
        next = gallery.jp_carousel( 'nextSlide' ),
        previousPrevious = previous.prev(),
        nextNext = next.next(),
        left = Math.floor( ( galleryWidth - currentWidth ) * 0.5 );

      current.jp_carousel( 'setSlidePosition', left ).show();

      // minimum width
      gallery.jp_carousel( 'fitInfo', animate );

      // prep the slides
      var direction = lastSelectedSlide.is( current.prevAll() ) ? 1 : -1;

      // Since we preload the `previousPrevious` and `nextNext` slides, we need
      // to make sure they technically visible in the DOM, but invisible to the
      // user. To hide them from the user, we position them outside the edges
      // of the window.
      //
      // This section of code only applies when there are more than three
      // slides. Otherwise, the `previousPrevious` and `nextNext` slides will
      // overlap with the `previous` and `next` slides which must be visible
      // regardless.
      if ( 1 === direction ) {
        if ( ! nextNext.is( previous ) ) {
          nextNext.jp_carousel( 'setSlidePosition', galleryWidth + next.width() ).show();
        }

        if ( ! previousPrevious.is( next ) ) {
          previousPrevious.jp_carousel( 'setSlidePosition', -previousPrevious.width() - currentWidth ).show();
        }
      } else {
        if ( ! nextNext.is( previous ) ) {
          nextNext.jp_carousel( 'setSlidePosition', galleryWidth + currentWidth ).show();
        }
      }

      previous.jp_carousel( 'setSlidePosition', Math.floor( -previous.width() + ( screenPadding * 0.75 ) ) ).show();
      next.jp_carousel( 'setSlidePosition', Math.ceil( galleryWidth - ( screenPadding * 0.75 ) ) ).show();
    },

    selectSlide : function(slide, animate){
      lastSelectedSlide = this.find( '.selected' ).removeClass( 'selected' );

      var slides = gallery.jp_carousel( 'slides' ).css({ 'position': 'fixed' }),
        current = $( slide ).addClass( 'selected' ).css({ 'position': 'relative' }),
        attachmentId = current.data( 'attachment-id' ),
        previous = gallery.jp_carousel( 'prevSlide' ),
        next = gallery.jp_carousel( 'nextSlide' ),
        previousPrevious = previous.prev(),
        nextNext = next.next(),
        animated,
        captionHtml;

      // center the main image
      gallery.jp_carousel( 'loadFullImage', current );

      caption.hide();

      if ( next.length === 0 && slides.length <= 2 ) {
        $( '.carousel-next-button' ).hide();
      } else {
        $( '.carousel-next-button' ).show();
      }

      if ( previous.length === 0 && slides.length <= 2 ) {
        $( '.carousel-previous-button' ).hide();
      } else {
        $( '.carousel-previous-button' ).show();
      }

      animated = current
        .add( previous )
        .add( previousPrevious )
        .add( next )
        .add( nextNext )
        .jp_carousel( 'loadSlide' );

      // slide the whole view to the x we want
      slides.not( animated ).hide();

      gallery.jp_carousel( 'updateSlidePositions', animate );

      container.trigger( 'jp_carousel.selectSlide', [current] );

      gallery.jp_carousel( 'getTitleDesc', {
        title: current.data( 'title' ),
        desc: current.data( 'desc' )
      });

      var imageMeta = current.data( 'image-meta' );
      // gallery.jp_carousel( 'updateExif', imageMeta );
      // gallery.jp_carousel( 'updateFullSizeLink', current );
      // gallery.jp_carousel( 'updateMap', imageMeta );


      // $('<div />').text(sometext).html() is a trick to go to HTML to plain
      // text (including HTML entities decode, etc)
      if ( current.data( 'caption' ) ) {
        captionHtml = $( '<div />' ).text( current.data( 'caption' ) ).html();

        if ( captionHtml === $( '<div />' ).text( current.data( 'title' ) ).html() ) {
          $( '.carousel-titleanddesc-title' ).fadeOut( 'fast' ).empty();
        }

        if ( captionHtml === $( '<div />' ).text( current.data( 'desc' ) ).html() ) {
          $( '.carousel-titleanddesc-desc' ).fadeOut( 'fast' ).empty();
        }

        caption.html( current.data( 'caption' ) ).fadeIn( 'slow' );
      } else {
        caption.fadeOut( 'fast' ).empty();
      }

      // Load the images for the next and previous slides.
      $( next ).add( previous ).each( function() {
        gallery.jp_carousel( 'loadFullImage', $( this ) );
      });

      window.location.hash = last_known_location_hash = '#carousel-' + attachmentId;
    },

    slides : function(){
      return this.find('.carousel-slide');
    },

    slideDimensions : function(){
      return {
        width: $(window).width() - (screenPadding * 2),
        height: Math.floor( $(window).height() / 100 * proportion - 60 )
      };
    },

    loadSlide : function() {
      return this.each(function(){
        var slide = $(this);
        slide.find('img')
          .one('load', function(){
            // set the width/height of the image if it's too big
            slide
              .jp_carousel('fitSlide',false);
          });
      });
    },

    bestFit : function(){
      var max        = gallery.jp_carousel('slideDimensions'),
          orig       = this.jp_carousel('originalDimensions'),
          orig_ratio = orig.width / orig.height,
          w_ratio    = 1,
          h_ratio    = 1,
          width, height;

      if ( orig.width > max.width ) {
        w_ratio = max.width / orig.width;
      }
      if ( orig.height > max.height ) {
        h_ratio = max.height / orig.height;
      }

      if ( w_ratio < h_ratio ) {
        width = max.width;
        height = Math.floor( width / orig_ratio );
      } else if ( h_ratio < w_ratio ) {
        height = max.height;
        width = Math.floor( height * orig_ratio );
      } else {
        width = orig.width;
        height = orig.height;
      }

      return {
        width: width,
        height: height
      };
    },

    fitInfo : function(/*animated*/){
      var current = this.jp_carousel('selectedSlide'),
        size = current.jp_carousel('bestFit');

      photo_info.css({
        'left'  : Math.floor( (info.width() - size.width) * 0.5 ),
        'width' : Math.floor( size.width )
      });

      return this;
    },

    fitMeta : function(animated){
      var newInfoTop   = { top: Math.floor( $(window).height() / 100 * proportion + 5 ) + 'px' };
      var newLeftWidth = { width: ( info.width() - (imageMeta.width() + 80) ) + 'px' };

      if (animated) {
        info.animate(newInfoTop);
        leftColWrapper.animate(newLeftWidth);
      } else {
        info.animate(newInfoTop);
        leftColWrapper.css(newLeftWidth);
      }
    },

    fitSlide : function(/*animated*/){
      return this.each(function(){
        var $this      = $(this),
            dimensions = $this.jp_carousel('bestFit'),
            method     = 'css',
            max        = gallery.jp_carousel('slideDimensions');

        dimensions.left = 0;
        dimensions.top = Math.floor( (max.height - dimensions.height) * 0.5 ) + 40;
        $this[method](dimensions);
      });
    },

    texturize : function(text) {
        text = '' + text; // make sure we get a string. Title "1" came in as int 1, for example, which did not support .replace().
        text = text.replace(/'/g, '&#8217;').replace(/&#039;/g, '&#8217;').replace(/[\u2019]/g, '&#8217;');
        text = text.replace(/"/g, '&#8221;').replace(/&#034;/g, '&#8221;').replace(/&quot;/g, '&#8221;').replace(/[\u201D]/g, '&#8221;');
        text = text.replace(/([\w]+)=&#[\d]+;(.+?)&#[\d]+;/g, '$1="$2"'); // untexturize allowed HTML tags params double-quotes
        return $.trim(text);
    },

    initSlides : function(items, start_index){
      if ( items.length < 2 ) {
        $( '.carousel-next-button, .carousel-previous-button' ).hide();
      } else {
        $( '.carousel-next-button, .carousel-previous-button' ).show();
      }

      // Calculate the new src.
      items.each(function(/*i*/){
        var src_item  = $(this),
          orig_size = src_item.data('orig-size') || '',
          max       = gallery.jp_carousel('slideDimensions'),
          parts     = orig_size.split(','),
          medium_file     = src_item.data('medium-file') || '',
          large_file      = src_item.data('large-file') || '',
          src;
        orig_size = {width: parseInt(parts[0], 10), height: parseInt(parts[1], 10)};

          src = src_item.data('orig-file');

          src = gallery.jp_carousel('selectBestImageSize', {
            orig_file   : src,
            orig_width  : orig_size.width,
            orig_height : orig_size.height,
            max_width   : max.width,
            max_height  : max.height,
            medium_file : medium_file,
            large_file  : large_file
          });

        // Set the final src
        $(this).data( 'gallery-src', src );
      });

      // If the start_index is not 0 then preload the clicked image first.
      if ( 0 !== start_index ) {
        $('<img/>')[0].src = $(items[start_index]).data('gallery-src');
      }

      var useInPageThumbnails = items.first().closest( '.tiled-gallery.type-rectangular' ).length > 0;

      // create the 'slide'
      items.each(function(i){
        var src_item        = $(this),
          attachment_id   = src_item.data('attachment-id') || 0,
          image_meta      = src_item.data('image-meta') || {},
          orig_size       = src_item.data('orig-size') || '',
          thumb_size      = { width : src_item[0].naturalWidth, height : src_item[0].naturalHeight },
          title           = src_item.data('image-title') || '',
          description     = src_item.data('image-description') || '',
          caption         = src_item.parents('.gallery-item').find('.gallery-caption').html() || '',
          src             = src_item.data('gallery-src') || '',
          medium_file     = src_item.data('medium-file') || '',
          large_file      = src_item.data('large-file') || '',
          orig_file       = src_item.data('orig-file') || '';

        var tiledCaption = src_item.parents('div.tiled-gallery-item').find('div.tiled-gallery-caption').html();
        if ( tiledCaption ) {
          caption = tiledCaption;
        }

        if ( attachment_id && orig_size.length ) {
          title       = gallery.jp_carousel('texturize', title);
          description = gallery.jp_carousel('texturize', description);
          caption     = gallery.jp_carousel('texturize', caption);

          // Initially, the image is a 1x1 transparent gif.  The preview is shown as a background image on the slide itself.
          var image = $( '<img/>' )
            .attr( 'src', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' )
            .css( 'width', '100%' )
            .css( 'height', '100%' );

          var slide = $('<div class="carousel-slide" itemprop="associatedMedia" itemscope itemtype="https://schema.org/ImageObject"></div>')
              .hide()
              .css({
                //'position' : 'fixed',
                'left'     : i < start_index ? -1000 : gallery.width()
              })
              .append( image )
              .appendTo(gallery)
              .data('src', src )
              .data('title', title)
              .data('desc', description)
              .data('caption', caption)
              .data('attachment-id', attachment_id)
              .data('permalink', src_item.parents('a').attr('href'))
              .data('orig-size', orig_size)
              .data('image-meta', image_meta)
              .data('medium-file', medium_file)
              .data('large-file', large_file)
              .data('orig-file', orig_file)
              .data('thumb-size', thumb_size)
              ;

            if ( useInPageThumbnails ) {
              // Use the image already loaded in the gallery as a preview.
              slide
                .data( 'preview-image', src_item.attr( 'src' ) )
                .css( {
                  'background-image' : 'url("' + src_item.attr( 'src' ) + '")',
                  'background-size' : '100% 100%',
                  'background-position' : 'center center'
                } );
            }

            slide.jp_carousel( 'fitSlide', false );
        }
      });
      return this;
    },

    selectBestImageSize: function(args) {
      if ( 'object' !== typeof args ) {
        args = {};
      }

      if ( 'undefined' === typeof args.orig_file ) {
        return '';
      }

      if ( 'undefined' === typeof args.orig_width || 'undefined' === typeof args.max_width ) {
        return args.orig_file;
      }

      if ( 'undefined' === typeof args.medium_file || 'undefined' === typeof args.large_file ) {
        return args.orig_file;
      }

      // Check if the image is being served by Photon (using a regular expression on the hostname).

      var imageLinkParser = document.createElement( 'a' );
      imageLinkParser.href = args.large_file;

      var isPhotonUrl = ( imageLinkParser.hostname.match( /^i[\d]{1}.wp.com$/i ) != null );

      var medium_size_parts = gallery.jp_carousel( 'getImageSizeParts', args.medium_file, args.orig_width, isPhotonUrl );
      var large_size_parts  = gallery.jp_carousel( 'getImageSizeParts', args.large_file, args.orig_width, isPhotonUrl );

      var large_width       = parseInt( large_size_parts[0], 10 ),
        large_height      = parseInt( large_size_parts[1], 10 ),
        medium_width      = parseInt( medium_size_parts[0], 10 ),
        medium_height     = parseInt( medium_size_parts[1], 10 );

      // Assign max width and height.
      args.orig_max_width  = args.max_width;
      args.orig_max_height = args.max_height;

      // Give devices with a higher devicePixelRatio higher-res images (Retina display = 2, Android phones = 1.5, etc)
      if ( 'undefined' !== typeof window.devicePixelRatio && window.devicePixelRatio > 1 ) {
        args.max_width  = args.max_width * window.devicePixelRatio;
        args.max_height = args.max_height * window.devicePixelRatio;
      }

      if ( large_width >= args.max_width || large_height >= args.max_height ) {
        return args.large_file;
      }

      if ( medium_width >= args.max_width || medium_height >= args.max_height ) {
        return args.medium_file;
      }

      if ( isPhotonUrl ) {
        // args.orig_file doesn't point to a Photon url, so in this case we use args.large_file
        // to return the photon url of the original image.
        var largeFileIndex = args.large_file.lastIndexOf( '?' );
        var origPhotonUrl = args.large_file;
        if ( -1 !== largeFileIndex ) {
          origPhotonUrl = args.large_file.substring( 0, largeFileIndex );
          // If we have a really large image load a smaller version
          // that is closer to the viewable size
          if ( args.orig_width > args.max_width || args.orig_height > args.max_height ) {
            origPhotonUrl += '?fit=' + args.orig_max_width + '%2C' + args.orig_max_height;
          }
        }
        return origPhotonUrl;
      }

      return args.orig_file;
    },

    getImageSizeParts: function( file, orig_width, isPhotonUrl ) {
      var size    = isPhotonUrl ?
              file.replace( /.*=([\d]+%2C[\d]+).*$/, '$1' ) :
              file.replace( /.*-([\d]+x[\d]+)\..+$/, '$1' );

      var size_parts  = ( size !== file ) ?
              ( isPhotonUrl ? size.split( '%2C' ) : size.split( 'x' ) ) :
              [ orig_width, 0 ];

      // If one of the dimensions is set to 9999, then the actual value of that dimension can't be retrieved from the url.
      // In that case, we set the value to 0.
      if ( '9999' === size_parts[0] ) {
        size_parts[0] = '0';
      }

      if ( '9999' === size_parts[1] ) {
        size_parts[1] = '0';
      }

      return size_parts;
    },

    originalDimensions: function() {
      var splitted = $(this).data('orig-size').split(',');
      return {width: parseInt(splitted[0], 10), height: parseInt(splitted[1], 10)};
    },

    format: function( args ) {
      if ( 'object' !== typeof args ) {
        args = {};
      }
      if ( ! args.text || 'undefined' === typeof args.text ) {
        return;
      }
      if ( ! args.replacements || 'undefined' === typeof args.replacements ) {
        return args.text;
      }
      return args.text.replace(/{(\d+)}/g, function( match, number ) {
        return typeof args.replacements[number] !== 'undefined' ? args.replacements[number] : match;
      });
    },

    /**
     * Returns a number in a fraction format that represents the shutter speed.
     * @param Number speed
     * @return String
     */
    shutterSpeed: function( speed ) {
      var denominator;

      // round to one decimal if value > 1s by multiplying it by 10, rounding, then dividing by 10 again
      if ( speed >= 1 ) {
        return Math.round( speed * 10 ) / 10 + 's';
      }

      // If the speed is less than one, we find the denominator by inverting
      // the number. Since cameras usually use rational numbers as shutter
      // speeds, we should get a nice round number. Or close to one in cases
      // like 1/30. So we round it.
      denominator = Math.round( 1 / speed );

      return '1/' + denominator + 's';
    },

    parseTitleDesc: function( value ) {
      if ( !value.match(' ') && value.match('_') ) {
        return '';
      }
      // Prefix list originally based on http://commons.wikimedia.org/wiki/MediaWiki:Filename-prefix-blacklist
      $([
        'CIMG',                   // Casio
        'DSC_',                   // Nikon
        'DSCF',                   // Fuji
        'DSCN',                   // Nikon
        'DUW',                    // some mobile phones
        'GEDC',                   // GE
        'IMG',                    // generic
        'JD',                     // Jenoptik
        'MGP',                    // Pentax
        'PICT',                   // misc.
        'Imagen',                 // misc.
        'Foto',                   // misc.
        'DSC',                    // misc.
        'Scan',                   // Scanners
        'SANY',                   // Sanyo
        'SAM',                    // Samsung
        'Screen Shot [0-9]+'      // Mac screenshots
      ])
      .each(function(key, val){
        var regex = new RegExp('^' + val);
        if ( regex.test(value) ) {
          value = '';
          return;
        }
      });
      return value;
    },

    getTitleDesc: function( data ) {
      var title ='', desc = '', markup = '', target;

      target = $( 'div.carousel-titleanddesc', 'div.carousel-wrap' );
      target.hide();

      title = gallery.jp_carousel('parseTitleDesc', data.title) || '';
      desc  = gallery.jp_carousel('parseTitleDesc', data.desc)  || '';

      if ( title.length || desc.length ) {
        // Convert from HTML to plain text (including HTML entities decode, etc)
        if ( $('<div />').html( title ).text() === $('<div />').html( desc ).text() ) {
          title = '';
        }

        markup  = ( title.length ) ? '<div class="carousel-titleanddesc-title">' + title + '</div>' : '';
        markup += ( desc.length )  ? '<div class="carousel-titleanddesc-desc">' + desc + '</div>'   : '';

        target.html( markup ).fadeIn('slow');
      }

    },

    // updateExif updates the contents of the exif UL (.carousel-image-exif)
    updateExif: function( meta ) {
      if ( !meta ) {
        return false;
      }

      var $ul = $( '<ul class=\'carousel-image-exif\'></ul>' );

      $.each( meta, function( key, val ) {
        if ( 0 === parseFloat(val) || !val.length || -1 === $.inArray( key, $.makeArray( jetpackCarouselStrings.meta_data ) ) ) {
          return;
        }

        switch( key ) {
          case 'focal_length':
            val = val + 'mm';
            break;
          case 'shutter_speed':
            val = gallery.jp_carousel('shutterSpeed', val);
            break;
          case 'aperture':
            val = 'f/' + val;
            break;
        }

        $ul.append( '<li><h5>' + jetpackCarouselStrings[key] + '</h5>' + val + '</li>' );
      });

      // Update (replace) the content of the ul
      $( 'div.carousel-image-meta ul.carousel-image-exif' ).replaceWith( $ul );
    },

    // updateFullSizeLink updates the contents of the carousel-image-download link
    updateFullSizeLink: function(current) {
      if(!current || !current.data) {
        return false;
      }
      var original,
        origSize = current.data('orig-size').split(',' ),
        imageLinkParser = document.createElement( 'a' );

      imageLinkParser.href = current.data( 'src' ).replace( /\?.+$/, '' );

      // Is this a Photon URL?
      if ( imageLinkParser.hostname.match( /^i[\d]{1}.wp.com$/i ) !== null ) {
        original = imageLinkParser.href;
      } else {
        original = current.data('orig-file').replace(/\?.+$/, '');
      }

      var permalink = $( '<a>'+gallery.jp_carousel('format', {'text': jetpackCarouselStrings.download_original, 'replacements': origSize})+'</a>' )
        .addClass( 'carousel-image-download' )
        .attr( 'href', original )
        .attr( 'target', '_blank' );

      // Update (replace) the content of the anchor
      $( 'div.carousel-image-meta a.carousel-image-download' ).replaceWith( permalink );
    },

    updateMap: function( meta ) {
      if ( !meta.latitude || !meta.longitude ) {
        return;
      }

      var latitude  = meta.latitude,
        longitude = meta.longitude,
        $metabox  = $( 'div.carousel-image-meta', 'div.carousel-wrap' ),
        $mapbox   = $( '<div></div>' ),
        style     = '&scale=2&style=feature:all|element:all|invert_lightness:true|hue:0x0077FF|saturation:-50|lightness:-5|gamma:0.91';

      $mapbox
        .addClass( 'carousel-image-map' )
        .html( '<img width="154" height="154" src="https://maps.googleapis.com/maps/api/staticmap?\
              center=' + latitude + ',' + longitude + '&\
              zoom=8&\
              size=154x154&\
              sensor=false&\
              markers=size:medium%7Ccolor:blue%7C' + latitude + ',' + longitude + style +'" class="gmap-main" />\
              \
            <div class="gmap-topright"><div class="imgclip"><img width="175" height="154" src="https://maps.googleapis.com/maps/api/staticmap?\
              center=' + latitude + ',' + longitude + '&\
              zoom=3&\
              size=175x154&\
              sensor=false&\
              markers=size:small%7Ccolor:blue%7C' + latitude + ',' + longitude + style + '"c /></div></div>\
              \
            ' )
        .prependTo( $metabox );
    },

    nextSlide : function () {
      var slides = this.jp_carousel( 'slides' );
      var selected = this.jp_carousel( 'selectedSlide' );

      if ( selected.length === 0 || ( slides.length > 2 && selected.is( slides.last() ) ) ) {
        return slides.first();
      }

      return selected.next();
    },

    prevSlide : function () {
      var slides = this.jp_carousel( 'slides' );
      var selected = this.jp_carousel( 'selectedSlide' );

      if ( selected.length === 0 || ( slides.length > 2 && selected.is( slides.first() ) ) ) {
        return slides.last();
      }

      return selected.prev();
    },

    loadFullImage : function ( slide ) {
      var image = slide.find( 'img:first' );

      if ( ! image.data( 'loaded' ) ) {
        // If the width of the slide is smaller than the width of the "thumbnail" we're already using,
        // don't load the full image.

        image.on( 'load.jetpack', function () {
          image.off( 'load.jetpack' );
          $( this ).closest( '.carousel-slide' ).css( 'background-image', '' );
        } );

        if ( ! slide.data( 'preview-image' ) || ( slide.data( 'thumb-size' ) && slide.width() > slide.data( 'thumb-size' ).width ) ) {
          image.attr( 'src', image.closest( '.carousel-slide' ).data( 'src' ) ).attr('itemprop', 'image');
        } else {
          image.attr( 'src', slide.data( 'preview-image' ) ).attr('itemprop', 'image');
        }

        image.data( 'loaded', 1 );
      }
    },

    hasMultipleImages : function () {
      return gallery.jp_carousel('slides').length > 1;
    }
  };

  $.fn.jp_carousel = function(method){
    // ask for the HTML of the gallery
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.open.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.jp_carousel' );
    }

  };

  // register the event listener for starting the gallery
  $( document.body ).on( 'click.carousel', 'div.gallery,div.tiled-gallery, a.single-image-gallery', function(e) {
    if ( ! $(this).jp_carousel( 'testForData', e.currentTarget ) ) {
      return;
    }
    if ( $(e.target).parent().hasClass('gallery-caption') ) {
      return;
    }
    e.preventDefault();

    // Stopping propagation in case there are parent elements
    // with .gallery or .tiled-gallery class
    e.stopPropagation();
    $(this).jp_carousel('open', {start_index: $(this).find('.gallery-item, .tiled-gallery-item').index($(e.target).parents('.gallery-item, .tiled-gallery-item'))});
  });

  // handle lightbox (single image gallery) for images linking to 'Attachment Page'
  if ( 1 === Number( jetpackCarouselStrings.single_image_gallery ) ) {
    processSingleImageGallery();
    $( document.body ).on( 'post-load', function() {
      processSingleImageGallery();
    } );
  }

  // Makes carousel work on page load and when back button leads to same URL with carousel hash (ie: no actual document.ready trigger)
  $( window ).on( 'hashchange.carousel', function () {

    var hashRegExp = /carousel-(\d+)/,
      matches, attachmentId, galleries, selectedThumbnail;

    if ( ! window.location.hash || ! hashRegExp.test( window.location.hash ) ) {
      if ( gallery && gallery.opened ) {
        container.jp_carousel( 'close' );
      }

      return;
    }

    if ( ( window.location.hash === last_known_location_hash ) && gallery.opened ) {
      return;
    }

    if ( window.location.hash && gallery && !gallery.opened && history.back) {
      history.back();
      return;
    }

    last_known_location_hash = window.location.hash;
    matches = window.location.hash.match( hashRegExp );
    attachmentId = parseInt( matches[1], 10 );
    galleries = $( 'div.gallery, div.tiled-gallery, a.single-image-gallery' );

    // Find the first thumbnail that matches the attachment ID in the location
    // hash, then open the gallery that contains it.
    galleries.each( function( _, galleryEl ) {
      $( galleryEl ).find('img').each( function( imageIndex, imageEl ) {
        if ( $( imageEl ).data( 'attachment-id' ) === parseInt( attachmentId, 10 ) ) {
          selectedThumbnail = { index: imageIndex, gallery: galleryEl };
          return false;
        }
      });

      if ( selectedThumbnail ) {
        $( selectedThumbnail.gallery )
          .jp_carousel( 'openOrSelectSlide', selectedThumbnail.index );
        return false;
      }
    });
  });

  if ( window.location.hash ) {
    $( window ).trigger( 'hashchange' );
  }
});

/**
 * jQuery Plugin to obtain touch gestures from iPhone, iPod Touch and iPad, should also work with Android mobile phones (not tested yet!)
 * Common usage: wipe images (left and right to show the previous or next image)
 *
 * @author Andreas Waltl, netCU Internetagentur (http://www.netcu.de)
 * Version 1.1.1, modified to pass the touchmove event to the callbacks.
 */
(function($) {
$.fn.touchwipe = function(settings) {
  var config = {
      min_move_x: 20,
      min_move_y: 20,
      wipeLeft: function(/*e*/) { },
      wipeRight: function(/*e*/) { },
      wipeUp: function(/*e*/) { },
      wipeDown: function(/*e*/) { },
      preventDefaultEvents: true
  };

  if (settings) {
    $.extend(config, settings);
  }

  this.each(function() {
    var startX;
    var startY;
    var isMoving = false;

    function cancelTouch() {
      this.removeEventListener('touchmove', onTouchMove);
      startX = null;
      isMoving = false;
    }

    function onTouchMove(e) {
      if(config.preventDefaultEvents) {
        e.preventDefault();
      }
      if(isMoving) {
        var x = e.touches[0].pageX;
        var y = e.touches[0].pageY;
        var dx = startX - x;
        var dy = startY - y;
        if(Math.abs(dx) >= config.min_move_x) {
          cancelTouch();
          if(dx > 0) {
            config.wipeLeft(e);
          } else {
            config.wipeRight(e);
          }
        }
        else if(Math.abs(dy) >= config.min_move_y) {
            cancelTouch();
            if(dy > 0) {
              config.wipeDown(e);
            } else {
              config.wipeUp(e);
            }
          }
      }
    }

    function onTouchStart(e)
    {
      if (e.touches.length === 1) {
        startX = e.touches[0].pageX;
        startY = e.touches[0].pageY;
        isMoving = true;
        this.addEventListener('touchmove', onTouchMove, false);
      }
    }
    if ('ontouchstart' in document.documentElement) {
      this.addEventListener('touchstart', onTouchStart, false);
    }
  });

  return this;
};
})(jQuery);
