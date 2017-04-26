<?php 

namespace Spnzr\Galleries;

class GalleryList {

  function __construct() {
    // remove_shortcode('gallery');
    // add_shortcode('gallery', array( $this, 'theGalleryList'));

  }


  /**
   * Filtered container div for gallery shortcode
   *  
   * for example: $output = apply_filters( 'gallery_style', array( $this, 'makeContainerCarousel') );
   */
  public static function make_list_container( ) {
    global $post;

    if ( isset( $post ) ) {
      $html = "<div id='gallery-{$post->post_name}' class='gallery-list'>";
    }

    return $html;
  }



  /**
   * @param array of attachment objects
   *  
   * @return string gallery
   */
  public static function the_gallery_list($attachments){
    global $post;

    $output = "<div id='gallery-{$post->post_name}' class='gallery-list'>";

    foreach ( $attachments as $id => $attachment ) {
      $output .= '<div class="gallery-list-item">';
      $att_title = apply_filters( 'the_title' , $attachment->post_title );
      $output .= wp_get_attachment_image( $attachment->ID , 'large' );
      if ($attachment->post_excerpt) {
          $output .= "<p class=\"caption\">" . $attachment->post_excerpt . "</p>";
      } else if ($attachment->post_title) {
          $output .= "<p class=\"caption\">" . $attachment->post_title . "</p>";
      }
    }
    $output .= '</div>';
    return $output;
  }
}