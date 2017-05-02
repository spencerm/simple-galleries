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

  /**
   * number of galleries active
   *  
   */
  static $gallery_number = 0;

  function __construct() {


    add_action( 'init', function () {
      add_image_size( 'spnzr_gallery_full', 660, 440, false ); 
    });

    /**
     * print options into WordPress add media template
     *  
     */
    if (is_admin()){
      add_action( 'print_media_templates', __NAMESPACE__ . '\\print_media_templates');
    }

    /**
     * Filtered html for gallery shortcode
     * @param $output 
     *  
     * for example: $output = apply_filters( 'gallery_style', array( $this, 'makeContainerCarousel') );
     */
    add_filter( 'post_gallery', array($this, 'new_gallery'), 5, 2);

  }

  public static function get_gallery_number(){
    return self::$gallery_number;
  }


  public function new_gallery( $output, $attr ){
    $data = new Data;

    $galleryType  = isset( $attr['type'] ) ? $attr['type'] : 'default-slideshow';
    $attachments  = Data::galleryAttr( $attr );
    $name         = Data::galleryName();

    self::$gallery_number ++;

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


