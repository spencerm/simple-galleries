<?php
/*
Plugin Name:  Simple Galleries
Plugin URL:   https://spnzr.com/
Description:  Easy, lightweight galleries, extending native WordPress gallery with Bootstrap 4
Version:      0.1
Author:       Spencer McCormick


License:            MIT License
License URI:        http://opensource.org/licenses/MIT
*/
namespace Spnzr\Galleries;


class SimpleGalleries{

  function __construct() {

    $data = new Data;

    add_action( 'init', function () {
      add_image_size( 'spnzr_gallery_full', 720, 480, true ); 
    });

    /**
     * print options into WordPress add media template
     *  
     */
    add_action( 'print_media_templates', __NAMESPACE__ . '\\print_media_templates');

    /**
     * Filtered html for gallery shortcode
     * @param $output 
     *  
     * for example: $output = apply_filters( 'gallery_style', array( $this, 'makeContainerCarousel') );
     */
    add_filter( 'post_gallery', function( $output, $attr ){
      $galleryType  = isset( $attr['type'] ) ? $attr['type'] : 'default-slideshow';
      $attachments  = Data::galleryAttr( $attr );
      $name         = Data::galleryName();


      switch ($galleryType) {
        case 'gallery-page':
          add_filter( 'wp_get_attachment_image_attributes', array( '\Spnzr\Galleries\CarouselLightbox', 'add_data_to_images' ), 1000, 2 );
          add_filter( 'gallery_style', array( '\Spnzr\Galleries\CarouselLightbox', 'make_gallery_container' ), 1000 );
          CarouselLightbox::enqueue_BS4_assets();
          break;
        case 'gallery-list':
          $output = GalleryList::the_gallery_list($attachments);
          break;
        case 'default-slideshow':
        default:
          $output = CarouselInline::the_BS4_carousel($attachments);
          break;
        }
      return $output;

    }, 5, 2);

  }

}


add_action('after_setup_theme', function(){
  require_once 'includes/data.php';
  if (is_admin()) {
    require_once 'includes/view-gallery-options.php';

  } else{
    require_once 'includes/gallery-carousel-lightbox.php';
    require_once 'includes/gallery-carousel-inline-bs4.php';
    require_once 'includes/gallery-list.php';
  }
  $gallery = new SimpleGalleries;
}, 100);


