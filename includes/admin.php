function register_settings() {
    add_settings_section('carousel_section', __( 'Image Gallery Carousel', 'jetpack' ), array( $this, 'carousel_section_callback' ), 'media');

    if ( ! $this->in_jetpack ) {
      add_settings_field('carousel_enable_it', __( 'Enable carousel', 'jetpack' ), array( $this, 'carousel_enable_it_callback' ), 'media', 'carousel_section' );
      register_setting( 'media', 'carousel_enable_it', array( $this, 'carousel_enable_it_sanitize' ) );
    }

    add_settings_field('carousel_background_color', __( 'Background color', 'jetpack' ), array( $this, 'carousel_background_color_callback' ), 'media', 'carousel_section' );
    register_setting( 'media', 'carousel_background_color', array( $this, 'carousel_background_color_sanitize' ) );

    add_settings_field('carousel_display_exif', __( 'Metadata', 'jetpack'), array( $this, 'carousel_display_exif_callback' ), 'media', 'carousel_section' );
    register_setting( 'media', 'carousel_display_exif', array( $this, 'carousel_display_exif_sanitize' ) );