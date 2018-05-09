<?php 

/**
 * modal gallery 
 *
 * using https://github.com/Automattic/jetpack/blob/master/modules/carousel/jetpack-carousel.php
 */ 

namespace Spnzr\Galleries;

class CarouselLightbox {


  /**
   * @param array of attachment objects
   *  
   * @return string gallery
   */
  public static function the_single_image_gallery($attachments) {
    global $post;

    $gallery_number = SimpleGalleries::get_gallery_number();
    
    /**
     * gallery div  
     */
    $gallery_div = "<div id='gallery-{$post->post_name}-{$gallery_number}' class='gallery carousel-lightbox'>";
    
    $output = apply_filters( 'gallery_style', $gallery_div );
    /**
     * gallery output  
     */
    $photo_number = 1;
    foreach ( $attachments as $id => $attachment ) {
      if ( $photo_number == 1 ){
        $output .= wp_get_attachment_link( $attachment->ID, 'spnzr_gallery_full', true, false, false, array( 'class' => 'd-block img-fluid active') );
        $output .= '<a class="btn btn-primary" href="' . get_attachment_link( $attachment->ID) .'" role="button"><i class="icon-slideshow"></i> Launch Slideshow</a>';
      } else {
        $output .= wp_get_attachment_link( $attachment->ID, 'spnzr_gallery_full', true, false, false, array( 'class' => 'd-none') );
      }
      $photo_number ++;
    }
    $output .= "</div>";
    return $output;
  }


  public static function enqueue_BS4_assets() {
      wp_enqueue_script( 'jetpack-carousel', plugins_url( '../js/spnzr-galleries.js', __FILE__ ), array( 'jquery' ), null, true );
      wp_enqueue_style( 'jetpack-carousel', plugins_url( '../css/jetpack-carousel.css', __FILE__ ) );

      // Note: using  home_url() instead of admin_url() for ajaxurl to be sure  to get same domain on wpcom when using mapped domains (also works on self-hosted)
      // Also: not hardcoding path since there is no guarantee site is running on site root in self-hosted context.
      $is_logged_in = is_user_logged_in();
      $current_user = wp_get_current_user();
      $localize_strings = array(
        // 'widths'               => $this->prebuilt_widths,
        'is_logged_in'         => $is_logged_in,
        'lang'                 => strtolower( substr( get_locale(), 0, 2 ) ),
        'ajaxurl'              => set_url_scheme( admin_url( 'admin-ajax.php' ) ),
        'nonce'                => wp_create_nonce( 'carousel_nonce' ),
        'display_exif'         => 0,
        'background_color'     => '#000',
        'download_original'    => sprintf( __( 'View full size <span class="photo-size">%1$s<span class="photo-size-times">&times;</span>%2$s</span>', 'jetpack' ), '{0}', '{1}' ),
        'camera'               => __( 'Camera', 'jetpack' ),
        'aperture'             => __( 'Aperture', 'jetpack' ),
        'shutter_speed'        => __( 'Shutter Speed', 'jetpack' ),
        'focal_length'         => __( 'Focal Length', 'jetpack' ),
        'copyright'            => __( 'Copyright', 'jetpack' ),
        /** This action is documented in core/src/wp-includes/link-template.php */
        'login_url'            => wp_login_url( apply_filters( 'the_permalink', get_permalink() ) ),
        'blog_id'              => (int) get_current_blog_id(),
        'meta_data'            => array( 'camera', 'aperture', 'shutter_speed', 'focal_length', 'copyright' )
      );
      wp_localize_script( 'jetpack-carousel', 'jetpackCarouselStrings', $localize_strings );
    //   $this->first_run = false;
    // }
  }

  /**
   * Adds data-* attributes required by carousel to img tags in post HTML
   * content. To be used by 'the_content' filter.
   *
   * @see add_data_to_images()
   * @see wp_make_content_images_responsive() in wp-includes/media.php
   *
   * @param string $content HTML content of the post
   * @return string Modified HTML content of the post
   */
  public static function add_data_img_tags_and_enqueue_assets( $content ) {
    if ( ! preg_match_all( '/<img [^>]+>/', $content, $matches ) ) {
      return $content;
    }
    $selected_images = array();

    foreach( $matches[0] as $image_html ) {
      if ( preg_match( '/wp-image-([0-9]+)/i', $image_html, $class_id ) &&
        ( $attachment_id = absint( $class_id[1] ) ) ) {

        /*
         * If exactly the same image tag is used more than once, overwrite it.
         * All identical tags will be replaced later with 'str_replace()'.
         */
        $selected_images[ $attachment_id  ] = $image_html;
      }
    }

    foreach ( $selected_images as $attachment_id => $image_html ) {
      $attachment = get_post( $attachment_id );

      if ( ! $attachment ) {
        continue;
      }

      $attributes = $this->add_data_to_images( array(), $attachment );
      $attributes_html = '';
      foreach( $attributes as $k => $v ) {
        $attributes_html .= esc_attr( $k ) . '="' . esc_attr( $v ) . '" ';
      }
      $image_html_with_data = str_replace( '<img ', "<img $attributes_html", $image_html );
      $content = str_replace( $image_html, $image_html_with_data, $content );
    }
    // $this->enqueue_assets();
    
    
    return $content;
  }


  /**
   * using wp_get_attachment_image_attributes filter
   */

  public static function add_data_to_images( $attr, $attachment = null ) {
    $attachment_id   = intval( $attachment->ID );
    $orig_file       = wp_get_attachment_image_src( $attachment_id, 'full' );
    $orig_file       = isset( $orig_file[0] ) ? $orig_file[0] : wp_get_attachment_url( $attachment_id );
    $meta            = wp_get_attachment_metadata( $attachment_id );
    $size            = isset( $meta['width'] ) ? intval( $meta['width'] ) . ',' . intval( $meta['height'] ) : '';
    $img_meta        = ( ! empty( $meta['image_meta'] ) ) ? (array) $meta['image_meta'] : array();

     /*
     * Note: Cannot generate a filename from the width and height wp_get_attachment_image_src() returns because
     * it takes the $content_width global variable themes can set in consideration, therefore returning sizes
     * which when used to generate a filename will likely result in a 404 on the image.
     * $content_width has no filter we could temporarily de-register, run wp_get_attachment_image_src(), then
     * re-register. So using returned file URL instead, which we can define the sizes from through filename
     * parsing in the JS, as this is a failsafe file reference.
     *
     */

    $medium_file_info = wp_get_attachment_image_src( $attachment_id, 'medium' );
    $medium_file      = isset( $medium_file_info[0] ) ? $medium_file_info[0] : '';

    $large_file_info  = wp_get_attachment_image_src( $attachment_id, 'large' );
    $large_file       = isset( $large_file_info[0] ) ? $large_file_info[0] : '';

    $attachment_title = wptexturize( get_post_field( 'post_title', $attachment_id ) );
    $attachment_desc  = wpautop( wptexturize( get_post_field( 'post_excerpt', $attachment_id ) ) );

    // Not yet providing geo-data, need to "fuzzify" for privacy
    // if ( ! empty( $img_meta ) ) {
    //   foreach ( $img_meta as $k => $v ) {
    //     if ( 'latitude' == $k || 'longitude' == $k )
    //       // unset( $img_meta[$k] );
    //   }
    // }

    // See https://github.com/Automattic/jetpack/issues/2765
    if ( isset( $img_meta['keywords'] ) ) {
      unset( $img_meta['keywords'] );
    }

    $img_meta = json_encode( array_map( 'strval', $img_meta ) );

    $attr['data-attachment-id']     = $attachment_id;
    $attr['data-permalink']         = esc_attr( get_permalink( $attachment->ID ) );
    $attr['data-orig-file']         = esc_attr( $orig_file );
    $attr['data-orig-size']         = $size;
    // $attr['data-image-meta']        = esc_attr( $img_meta );
    $attr['data-image-title']       = esc_attr( $attachment_title );
    $attr['data-image-description'] = esc_attr( $attachment_desc );
    $attr['data-medium-file']       = esc_attr( $medium_file );
    $attr['data-large-file']        = esc_attr( $large_file );

    return $attr;
  }
  /**
   * Filtered container div for gallery shortcode
   *  
   */
  public static function make_gallery_container( $html ) {
    global $post;

    if ( isset( $post ) ) {
      $blog_id = (int) get_current_blog_id();

      $extra_data = array(
        'data-carousel-extra' => array(
          'blog_id' => $blog_id,
          'permalink' => get_permalink( $post->ID ),
          )
        );
      foreach ( (array) $extra_data as $data_key => $data_values ) {
        $html = str_replace( '<div ', '<div ' . esc_attr( $data_key ) . "='" . json_encode( $data_values ) . "' ", $html );
      }
    }

    return $html;
  }


}