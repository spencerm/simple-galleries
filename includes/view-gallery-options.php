<?php

namespace Spnzr\Galleries;

/**
 * Set up the new field in the media module.
 *
 * @return void
 */


function print_media_templates(){

  ?>

    <script type="text/html" id="tmpl-custom-gallery-setting">
        <label class="setting">
            <span>Type</span>
            <select data-setting="type">
                <option value="default-slideshow">Inline Slideshow</option>
                <option value="gallery-page">Gallery Page / Lightbox</option>
                <option value="gallery-list">List "Buzzfeed" Slideshow</option>
            </select>
        </label>
        <label class="setting">
            <span>Style</span>
            <select data-setting="style">
                <option value="gallery-dark">Dark</option>
                <option value="gallery-light">Light</option>
            </select>
        </label>
        <label class="setting">
            <span>Show Meta Data</span>
            <select data-setting="exif">
                <option value="0">No</option>
                <option value="1">Yes</option>
            </select>
        </label>
    </script>

    <script type="text/javascript">
        jQuery( document ).ready( function() {
            _.extend( wp.media.gallery.defaults, {
                type:  'default-slideshow',
                style: 'gallery-dark',
                exif:  '0'
            } );

            wp.media.view.Settings.Gallery = wp.media.view.Settings.Gallery.extend( {
                template: function( view ) {
                    return wp.media.template( 'gallery-settings' )( view )
                         + wp.media.template( 'custom-gallery-setting' )( view );
                }
            } );
        } );
    </script>

  <?php
};
