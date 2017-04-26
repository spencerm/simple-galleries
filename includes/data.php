<?php

namespace Spnzr\Galleries;

class Data {

  public $prebuilt_widths   = array( 370, 700, 1000, 1200, 1400, 2000 );
  public $first_run         = true;
  private $exif             = false;
  private $style            = 'dark';


	protected function get_exif () {
    return self::exif;
	}
  public static function galleryName(){
    $post = get_post();

    return $post->post_name;

  }
  public static function galleryAttr( $attr ){
    $post = get_post();

    if ( ! empty( $attr['ids'] ) ) {
      // 'ids' is explicitly ordered, unless you specify otherwise.
      if ( empty( $attr['orderby'] ) ) {
        $attr['orderby'] = 'post__in';
      }
      $attr['include'] = $attr['ids'];
    }
    $atts = shortcode_atts( array(
      'order'      => 'ASC',
      'orderby'    => 'menu_order ID',
      'id'         => $post ? $post->ID : 0,
      'itemtag'    => 'figure',
      'icontag'    => 'div',
      'captiontag' => 'figcaption',
      'columns'    => 3,
      'size'       => 'thumbnail',
      'include'    => '',
      'exclude'    => '',
      'link'       => ''
    ), $attr, 'gallery' );
    $id = intval( $atts['id'] );
    if ( ! empty( $atts['include'] ) ) {
      $_attachments = get_posts( array( 'include' => $atts['include'], 'post_status' => 'inherit', 'post_type' => 'attachment', 'post_mime_type' => 'image', 'order' => $atts['order'], 'orderby' => $atts['orderby'] ) );
      $attachments = array();
      foreach ( $_attachments as $key => $val ) {
        $attachments[$val->ID] = $_attachments[$key];
      }
    } elseif ( ! empty( $atts['exclude'] ) ) {
      $attachments = get_children( array( 'post_parent' => $id, 'exclude' => $atts['exclude'], 'post_status' => 'inherit', 'post_type' => 'attachment', 'post_mime_type' => 'image', 'order' => $atts['order'], 'orderby' => $atts['orderby'] ) );
    } else {
      $attachments = get_children( array( 'post_parent' => $id, 'post_status' => 'inherit', 'post_type' => 'attachment', 'post_mime_type' => 'image', 'order' => $atts['order'], 'orderby' => $atts['orderby'] ) );
    }
    if ( empty( $attachments ) ) {
      return '';
    }
    return $attachments;
  }

	
}

