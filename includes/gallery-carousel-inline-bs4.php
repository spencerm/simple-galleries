<?php 

namespace Spnzr\Galleries;

class CarouselInline {


  /**
   * Filtered div for gallery shortcode
   *  
   * for example: $output = apply_filters( 'gallery_style', array( $this, 'makeContainerCarousel') );
   */
  public static function make_container_carousel( $html ) {
    global $post;
    if ( isset( $post ) ) {
      $html = "<div id='gallery-{$post->post_name}' class='carousel slide'><div class='carousel-inner' role='listbox'>";
    }
    return $html;
  }
  /**
   * @param array of attachment objects
   *  
   * @return string gallery
   */
  public static function the_BS4_carousel($attachments) {
    global $post;
    $gallery_number = SimpleGalleries::get_gallery_number();

    $number_photos = count( $attachments );

    /**
     * gallery div & plugin filter 
     */
    $gallery_div = "<div id='gallery-{$post->post_name}-{$gallery_number}' class='carousel slide inline660px bg-inverse'><div class='carousel-inner' role='listbox'>";
    
    $output = apply_filters( 'gallery_style', $gallery_div );

    /**
     * carousel indicators  
     */
    // $output .= '<ol class="carousel-indicators">';
    // $photo_number = 0;
    // foreach ( $attachments as $key => $value ) {
    //     $output .= "<li data-target='#gallery-{$post->post_name}-{$gallery_number}' data-slide-to='{$photo_number}'></li>";
    //     $photo_number ++;
    // }
    // $output .= '</ol>';

    $photo_number = 1;
    foreach ( $attachments as $id => $attachment ) {
        if ( $photo_number == 1 ){
            $output .= '<div class="carousel-item active">';
        } else {
            $output .= '<div class="carousel-item">';
        }
        $photo_number ++;
        $att_title = apply_filters( 'the_title' , $attachment->post_title );
        $output .= wp_get_attachment_image( $attachment->ID , 'spnzr_gallery_full' , 'd-block img-fluid' );
        $output .= "<div class='carousel-caption'>";
        // $output .= "<p class='d-none d-md-block'>foto {$photo_number} / {$number_photos} </p>";
        if ( $attachment->post_excerpt ){
            $output .= "<p class='d-none d-sm-block'>{$attachment->post_excerpt}</p>";
        } else if ( $attachment->post_title ){
            $output .= "<p class='d-none d-sm-block'>{$attachment->post_title}</p>";
        }
        $output .= '</div></div>';
    }
    $output .= "</div>";
    $output .= "<a class='carousel-control-prev' href='#gallery-{$post->post_name}-{$gallery_number}' role='button' data-slide='prev'> <span class='fa fa-3x fa-angle-left' aria-hidden='true'></span> <span class='sr-only'>Previous</span> </a> <a class='carousel-control-next' href='#gallery-{$post->post_name}-{$gallery_number}' role='button' data-slide='next'> <span class='fa fa-3x fa-angle-right' aria-hidden='true'></span> <span class='sr-only'>Next</span></a>";
    $output .= "</div>";

    return $output;
  }
}