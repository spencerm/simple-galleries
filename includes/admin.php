<?php 

namespace Spnzr\Galleries;

class Admin{

  public function register_settings() {
    add_settings_section('carousel_section', 'Image Gallery Options', array( $this, 'carousel_section_callback' ), 'media');


    add_settings_field('carousel_display_exif', __( 'Metadata', 'jetpack'), array( $this, 'carousel_display_exif_callback' ), 'media', 'carousel_section' );
    register_setting( 'enqueue_bs4_carousel', 'carousel_display_exif', array( $this, 'carousel_display_exif_sanitize' ) );
  }
  

  // Fulfill the settings section callback requirement by returning nothing
  function carousel_section_callback() {
    return;
  }

}

add_action( 'admin_init', array( $this, 'register_settings' ), 5 );